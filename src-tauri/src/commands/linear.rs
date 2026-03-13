use serde::{Deserialize, Serialize};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LinearIssue {
    pub id: String,
    pub identifier: String,
    pub title: String,
    pub description: Option<String>,
    pub state: IssueState,
    pub priority: IssuePriority,
    pub assignee_name: Option<String>,
    pub team: Option<LinearTeam>,
    pub labels: Vec<IssueLabel>,
    pub created_at: String,
    pub updated_at: String,
    pub url: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IssueLabel {
    pub name: String,
    pub color: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IssueState {
    pub name: String,
    pub color: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IssuePriority {
    pub label: String,
    pub number: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LinearTeam {
    pub id: String,
    pub name: String,
    pub key: String,
}

// ---------------------------------------------------------------------------
// GraphQL response shapes
// ---------------------------------------------------------------------------

#[derive(Deserialize)]
struct GqlResponse<T> {
    data: Option<T>,
    errors: Option<Vec<GqlError>>,
}

#[derive(Deserialize)]
struct GqlError {
    message: String,
}

// -- Issues
#[derive(Deserialize)]
struct IssuesData {
    viewer: ViewerIssues,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ViewerIssues {
    assigned_issues: IssueConnection,
}

#[derive(Deserialize)]
struct IssueConnection {
    nodes: Vec<IssueNode>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct IssueNode {
    id: String,
    identifier: String,
    title: String,
    description: Option<String>,
    state: StateNode,
    priority: f64,
    priority_label: String,
    assignee: Option<AssigneeNode>,
    team: Option<TeamNodeInline>,
    labels: LabelConnection,
    created_at: String,
    updated_at: String,
    url: String,
}

#[derive(Deserialize)]
struct TeamNodeInline {
    id: String,
    name: String,
    key: String,
}

#[derive(Deserialize)]
struct StateNode {
    name: String,
    color: String,
}

#[derive(Deserialize)]
struct AssigneeNode {
    name: String,
}

#[derive(Deserialize)]
struct LabelConnection {
    nodes: Vec<LabelNode>,
}

#[derive(Deserialize)]
struct LabelNode {
    name: String,
    color: String,
}

// -- Teams
#[derive(Deserialize)]
struct TeamsData {
    teams: TeamConnection,
}

#[derive(Deserialize)]
struct TeamConnection {
    nodes: Vec<TeamNode>,
}

#[derive(Deserialize)]
struct TeamNode {
    id: String,
    name: String,
    key: String,
}

// -- Update issue
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct UpdateIssueData {
    issue_update: IssueUpdatePayload,
}

#[derive(Deserialize)]
struct IssueUpdatePayload {
    success: bool,
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

#[tauri::command]
pub async fn fetch_issues(
    api_key: String,
    team_id: Option<String>,
) -> Result<Vec<LinearIssue>, String> {
    let filter = match &team_id {
        Some(tid) => format!(r#", filter: {{ team: {{ id: {{ eq: "{}" }} }} }}"#, tid),
        None => String::new(),
    };

    let query = format!(
        r#"
        query {{
          viewer {{
            assignedIssues(
              first: 50
              orderBy: updatedAt
              {filter}
            ) {{
              nodes {{
                id
                identifier
                title
                description
                state {{
                  name
                  color
                }}
                priority
                priorityLabel
                assignee {{
                  name
                }}
                team {{
                  id
                  name
                  key
                }}
                labels {{
                  nodes {{
                    name
                    color
                  }}
                }}
                createdAt
                updatedAt
                url
              }}
            }}
          }}
        }}
        "#,
        filter = filter
    );

    let nodes = send_linear_graphql::<IssuesData>(&api_key, &query).await?;
    let issues = nodes
        .viewer
        .assigned_issues
        .nodes
        .into_iter()
        .map(|n| LinearIssue {
            id: n.id,
            identifier: n.identifier,
            title: n.title,
            description: n.description,
            state: IssueState { name: n.state.name, color: n.state.color },
            priority: IssuePriority { label: n.priority_label, number: n.priority as i32 },
            assignee_name: n.assignee.map(|a| a.name),
            team: n.team.map(|t| LinearTeam { id: t.id, name: t.name, key: t.key }),
            labels: n.labels.nodes.into_iter().map(|l| IssueLabel { name: l.name, color: l.color }).collect(),
            created_at: n.created_at,
            updated_at: n.updated_at,
            url: n.url,
        })
        .collect();

    Ok(issues)
}

#[tauri::command]
pub async fn update_issue_status(
    api_key: String,
    issue_id: String,
    state_id: String,
) -> Result<String, String> {
    let query = r#"
        mutation($issueId: String!, $stateId: String!) {
          issueUpdate(id: $issueId, input: { stateId: $stateId }) {
            success
          }
        }
    "#;

    let body = serde_json::json!({
        "query": query,
        "variables": {
            "issueId": issue_id,
            "stateId": state_id,
        }
    });

    let client = reqwest::Client::new();
    let resp = client
        .post("https://api.linear.app/graphql")
        .header("Authorization", &api_key)
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("update_issue_status: request failed: {}", e))?;

    if !resp.status().is_success() {
        let status = resp.status();
        let text = resp.text().await.unwrap_or_default();
        return Err(format!("update_issue_status: Linear API returned {}: {}", status, text));
    }

    let gql: GqlResponse<UpdateIssueData> = resp
        .json()
        .await
        .map_err(|e| format!("update_issue_status: failed to parse response: {}", e))?;

    if let Some(errors) = gql.errors {
        let msgs: Vec<String> = errors.into_iter().map(|e| e.message).collect();
        return Err(format!("Linear GraphQL errors: {}", msgs.join("; ")));
    }

    match gql.data {
        Some(d) if d.issue_update.success => Ok("Issue status updated successfully".to_string()),
        _ => Err("update_issue_status: mutation returned success=false".to_string()),
    }
}

#[tauri::command]
pub async fn fetch_teams(api_key: String) -> Result<Vec<LinearTeam>, String> {
    let query = r#"
        query {
          teams(first: 50) {
            nodes {
              id
              name
              key
            }
          }
        }
    "#;

    let data = send_linear_graphql::<TeamsData>(&api_key, query).await?;
    Ok(data
        .teams
        .nodes
        .into_iter()
        .map(|t| LinearTeam { id: t.id, name: t.name, key: t.key })
        .collect())
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async fn send_linear_graphql<T: serde::de::DeserializeOwned>(
    api_key: &str,
    query: &str,
) -> Result<T, String> {
    let body = serde_json::json!({ "query": query });

    let client = reqwest::Client::new();
    let resp = client
        .post("https://api.linear.app/graphql")
        .header("Authorization", api_key)
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Linear GraphQL request failed: {}", e))?;

    if !resp.status().is_success() {
        let status = resp.status();
        let text = resp.text().await.unwrap_or_default();
        return Err(format!("Linear API returned {}: {}", status, text));
    }

    let gql: GqlResponse<T> =
        resp.json().await.map_err(|e| format!("Failed to parse Linear GraphQL response: {}", e))?;

    if let Some(errors) = gql.errors {
        let msgs: Vec<String> = errors.into_iter().map(|e| e.message).collect();
        return Err(format!("Linear GraphQL errors: {}", msgs.join("; ")));
    }

    gql.data.ok_or_else(|| "Linear GraphQL response contained no data".to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn linear_issue_serialization_roundtrip() {
        let issue = LinearIssue {
            id: "issue-1".to_string(),
            identifier: "SER-1234".to_string(),
            title: "Fix auth flow".to_string(),
            description: Some("The login page has a bug".to_string()),
            state: IssueState { name: "In Progress".to_string(), color: "#f2c94c".to_string() },
            priority: IssuePriority { label: "High".to_string(), number: 2 },
            assignee_name: Some("Priyanshu".to_string()),
            team: Some(LinearTeam { id: "team-1".to_string(), name: "Server".to_string(), key: "SER".to_string() }),
            labels: vec![
                IssueLabel { name: "bug".to_string(), color: "#ef4444".to_string() },
                IssueLabel { name: "auth".to_string(), color: "#6366f1".to_string() },
            ],
            created_at: "2026-01-01T00:00:00Z".to_string(),
            updated_at: "2026-01-02T00:00:00Z".to_string(),
            url: "https://linear.app/team/issue/SER-1234".to_string(),
        };

        let json = serde_json::to_string(&issue).expect("serialize LinearIssue");
        let deserialized: LinearIssue =
            serde_json::from_str(&json).expect("deserialize LinearIssue");

        assert_eq!(deserialized.id, "issue-1");
        assert_eq!(deserialized.identifier, "SER-1234");
        assert_eq!(deserialized.title, "Fix auth flow");
        assert_eq!(deserialized.description, Some("The login page has a bug".to_string()));
        assert_eq!(deserialized.state.name, "In Progress");
        assert_eq!(deserialized.state.color, "#f2c94c");
        assert_eq!(deserialized.priority.label, "High");
        assert_eq!(deserialized.priority.number, 2);
        assert_eq!(deserialized.assignee_name, Some("Priyanshu".to_string()));
        assert_eq!(deserialized.team.as_ref().unwrap().name, "Server");
        assert_eq!(deserialized.labels.len(), 2);
        assert_eq!(deserialized.labels[0].name, "bug");
        assert_eq!(deserialized.labels[0].color, "#ef4444");
    }

    #[test]
    fn linear_issue_optional_fields_none() {
        let issue = LinearIssue {
            id: "issue-2".to_string(),
            identifier: "SER-5678".to_string(),
            title: "Unassigned task".to_string(),
            description: None,
            state: IssueState { name: "Backlog".to_string(), color: "#bbb".to_string() },
            priority: IssuePriority { label: "No priority".to_string(), number: 0 },
            assignee_name: None,
            team: None,
            labels: vec![],
            created_at: "2026-01-01T00:00:00Z".to_string(),
            updated_at: "2026-01-01T00:00:00Z".to_string(),
            url: "https://linear.app/team/issue/SER-5678".to_string(),
        };

        let json = serde_json::to_string(&issue).unwrap();
        let deserialized: LinearIssue = serde_json::from_str(&json).unwrap();
        assert!(deserialized.description.is_none());
        assert!(deserialized.assignee_name.is_none());
        assert!(deserialized.team.is_none());
        assert!(deserialized.labels.is_empty());
    }

    #[test]
    fn linear_team_serialization() {
        let team = LinearTeam {
            id: "team-abc".to_string(),
            name: "Platform".to_string(),
            key: "PLT".to_string(),
        };

        let json = serde_json::to_string(&team).expect("serialize LinearTeam");
        let deserialized: LinearTeam = serde_json::from_str(&json).expect("deserialize LinearTeam");

        assert_eq!(deserialized.id, "team-abc");
        assert_eq!(deserialized.name, "Platform");
        assert_eq!(deserialized.key, "PLT");
    }

    #[test]
    fn issue_state_serialization() {
        let state = IssueState { name: "Done".to_string(), color: "#27ae60".to_string() };

        let json = serde_json::to_string(&state).unwrap();
        assert!(json.contains("Done"));
        assert!(json.contains("#27ae60"));
    }

    #[test]
    fn issue_priority_serialization() {
        let priority = IssuePriority { label: "Urgent".to_string(), number: 1 };

        let json = serde_json::to_string(&priority).unwrap();
        let deserialized: IssuePriority = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.label, "Urgent");
        assert_eq!(deserialized.number, 1);
    }

    #[tokio::test]
    async fn fetch_issues_empty_api_key_fails() {
        let result = fetch_issues("".to_string(), None).await;
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn fetch_teams_empty_api_key_fails() {
        let result = fetch_teams("".to_string()).await;
        assert!(result.is_err());
    }

    #[test]
    fn graphql_query_format_issues() {
        let filter = String::new();
        let query = format!(
            r#"
            query {{
              viewer {{
                assignedIssues(
                  first: 50
                  orderBy: updatedAt
                  {filter}
                ) {{
                  nodes {{
                    id
                    identifier
                    title
                    description
                    state {{
                      name
                      color
                    }}
                    priority
                    priorityLabel
                    assignee {{
                      name
                    }}
                    team {{
                      id
                      name
                      key
                    }}
                    labels {{
                      nodes {{
                        name
                        color
                      }}
                    }}
                    createdAt
                    updatedAt
                    url
                  }}
                }}
              }}
            }}
            "#,
            filter = filter
        );

        assert!(query.contains("viewer"));
        assert!(query.contains("assignedIssues"));
        assert!(query.contains("identifier"));
        assert!(query.contains("priorityLabel"));
        assert!(query.contains("assignee"));
        assert!(query.contains("team"));
        assert!(query.contains("labels"));
        assert!(query.contains("createdAt"));
        assert!(query.contains("updatedAt"));
    }

    #[test]
    fn graphql_query_with_team_filter() {
        let team_id = "team-123";
        let filter = format!(r#", filter: {{ team: {{ id: {{ eq: "{}" }} }} }}"#, team_id);

        assert!(filter.contains("team-123"));
        assert!(filter.contains("filter"));
        assert!(filter.contains("eq"));
    }
}
