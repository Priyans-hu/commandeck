use serde::{Deserialize, Serialize};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PullRequest {
    pub id: String,
    pub title: String,
    pub number: i32,
    pub repo_name: String,
    pub repo_owner: String,
    pub state: String,
    pub created_at: String,
    pub updated_at: String,
    pub additions: i32,
    pub deletions: i32,
    pub review_decision: Option<String>,
    pub url: String,
    pub author: String,
    pub head_ref: String,
    pub base_ref: String,
    pub is_draft: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PrFileChange {
    pub filename: String,
    pub status: String,
    pub additions: i32,
    pub deletions: i32,
    pub patch: Option<String>,
}

// ---------------------------------------------------------------------------
// GraphQL response shapes
// ---------------------------------------------------------------------------

#[derive(Deserialize)]
struct GqlResponse {
    data: Option<GqlData>,
    errors: Option<Vec<GqlError>>,
}

#[derive(Deserialize)]
struct GqlError {
    message: String,
}

#[derive(Deserialize)]
struct GqlData {
    search: Option<SearchResult>,
}

#[derive(Deserialize)]
struct SearchResult {
    nodes: Vec<PrNode>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct PrNode {
    id: String,
    title: String,
    number: i32,
    repository: RepoNode,
    state: String,
    created_at: String,
    updated_at: String,
    additions: i32,
    deletions: i32,
    review_decision: Option<String>,
    url: String,
    author: Option<AuthorNode>,
    head_ref_name: String,
    base_ref_name: String,
    is_draft: bool,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct RepoNode {
    name: String,
    owner: RepoOwner,
}

#[derive(Deserialize)]
struct RepoOwner {
    login: String,
}

#[derive(Deserialize)]
struct AuthorNode {
    login: String,
}

// REST API response for file changes
#[derive(Deserialize)]
struct RestFileChange {
    filename: String,
    status: String,
    additions: i32,
    deletions: i32,
    patch: Option<String>,
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

#[tauri::command]
pub async fn fetch_pull_requests(
    token: String,
    username: String,
) -> Result<Vec<PullRequest>, String> {
    let query = format!(
        r#"
        query {{
          search(query: "is:pr is:open author:{username} sort:updated-desc", type: ISSUE, first: 50) {{
            nodes {{
              ... on PullRequest {{
                id
                title
                number
                repository {{
                  name
                  owner {{ login }}
                }}
                state
                createdAt
                updatedAt
                additions
                deletions
                reviewDecision
                url
                author {{ login }}
                headRefName
                baseRefName
                isDraft
              }}
            }}
          }}
        }}
        "#,
        username = username
    );

    let review_query = format!(
        r#"
        query {{
          search(query: "is:pr is:open review-requested:{username} sort:updated-desc", type: ISSUE, first: 50) {{
            nodes {{
              ... on PullRequest {{
                id
                title
                number
                repository {{
                  name
                  owner {{ login }}
                }}
                state
                createdAt
                updatedAt
                additions
                deletions
                reviewDecision
                url
                author {{ login }}
                headRefName
                baseRefName
                isDraft
              }}
            }}
          }}
        }}
        "#,
        username = username
    );

    let client = reqwest::Client::new();

    let (authored_resp, review_resp) = tokio::join!(
        send_github_graphql(&client, &token, &query),
        send_github_graphql(&client, &token, &review_query),
    );

    let mut prs: Vec<PullRequest> = Vec::new();
    let mut seen_ids: std::collections::HashSet<String> = std::collections::HashSet::new();

    for resp in [authored_resp?, review_resp?] {
        for node in resp {
            if seen_ids.insert(node.id.clone()) {
                prs.push(PullRequest {
                    id: node.id,
                    title: node.title,
                    number: node.number,
                    repo_name: node.repository.name,
                    repo_owner: node.repository.owner.login,
                    state: node.state,
                    created_at: node.created_at,
                    updated_at: node.updated_at,
                    additions: node.additions,
                    deletions: node.deletions,
                    review_decision: node.review_decision,
                    url: node.url,
                    author: node.author.map(|a| a.login).unwrap_or_default(),
                    head_ref: node.head_ref_name,
                    base_ref: node.base_ref_name,
                    is_draft: node.is_draft,
                });
            }
        }
    }

    Ok(prs)
}

#[tauri::command]
pub async fn fetch_pr_diff(
    token: String,
    owner: String,
    repo: String,
    pr_number: i32,
) -> Result<Vec<PrFileChange>, String> {
    let url = format!(
        "https://api.github.com/repos/{owner}/{repo}/pulls/{pr_number}/files",
        owner = owner,
        repo = repo,
        pr_number = pr_number
    );

    let client = reqwest::Client::new();
    let resp = client
        .get(&url)
        .header("Authorization", format!("Bearer {}", token))
        .header("Accept", "application/vnd.github+json")
        .header("User-Agent", "CommanDeck")
        .header("X-GitHub-Api-Version", "2022-11-28")
        .send()
        .await
        .map_err(|e| format!("fetch_pr_diff: request failed: {}", e))?;

    if !resp.status().is_success() {
        let status = resp.status();
        let body = resp.text().await.unwrap_or_default();
        return Err(format!(
            "fetch_pr_diff: GitHub API returned {}: {}",
            status, body
        ));
    }

    let files: Vec<RestFileChange> = resp
        .json()
        .await
        .map_err(|e| format!("fetch_pr_diff: failed to parse response: {}", e))?;

    Ok(files
        .into_iter()
        .map(|f| PrFileChange {
            filename: f.filename,
            status: f.status,
            additions: f.additions,
            deletions: f.deletions,
            patch: f.patch,
        })
        .collect())
}

#[tauri::command]
pub async fn submit_pr_review(
    token: String,
    owner: String,
    repo: String,
    pr_number: i32,
    event: String,
    body: String,
) -> Result<String, String> {
    let url = format!(
        "https://api.github.com/repos/{owner}/{repo}/pulls/{pr_number}/reviews",
        owner = owner,
        repo = repo,
        pr_number = pr_number
    );

    let payload = serde_json::json!({
        "event": event,
        "body": body,
    });

    let client = reqwest::Client::new();
    let resp = client
        .post(&url)
        .header("Authorization", format!("Bearer {}", token))
        .header("Accept", "application/vnd.github+json")
        .header("User-Agent", "CommanDeck")
        .header("X-GitHub-Api-Version", "2022-11-28")
        .json(&payload)
        .send()
        .await
        .map_err(|e| format!("submit_pr_review: request failed: {}", e))?;

    if !resp.status().is_success() {
        let status = resp.status();
        let body = resp.text().await.unwrap_or_default();
        return Err(format!(
            "submit_pr_review: GitHub API returned {}: {}",
            status, body
        ));
    }

    Ok("Review submitted successfully".to_string())
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async fn send_github_graphql(
    client: &reqwest::Client,
    token: &str,
    query: &str,
) -> Result<Vec<PrNode>, String> {
    let body = serde_json::json!({ "query": query });

    let resp = client
        .post("https://api.github.com/graphql")
        .header("Authorization", format!("Bearer {}", token))
        .header("User-Agent", "CommanDeck")
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("GitHub GraphQL request failed: {}", e))?;

    if !resp.status().is_success() {
        let status = resp.status();
        let text = resp.text().await.unwrap_or_default();
        return Err(format!("GitHub GraphQL returned {}: {}", status, text));
    }

    let gql: GqlResponse = resp
        .json()
        .await
        .map_err(|e| format!("Failed to parse GitHub GraphQL response: {}", e))?;

    if let Some(errors) = gql.errors {
        let msgs: Vec<String> = errors.into_iter().map(|e| e.message).collect();
        return Err(format!("GitHub GraphQL errors: {}", msgs.join("; ")));
    }

    Ok(gql
        .data
        .and_then(|d| d.search)
        .map(|s| s.nodes)
        .unwrap_or_default())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn pull_request_serialization_roundtrip() {
        let pr = PullRequest {
            id: "PR_123".to_string(),
            title: "Fix login bug".to_string(),
            number: 42,
            repo_name: "commandeck".to_string(),
            repo_owner: "Priyans-hu".to_string(),
            state: "OPEN".to_string(),
            created_at: "2026-01-01T00:00:00Z".to_string(),
            updated_at: "2026-01-02T00:00:00Z".to_string(),
            additions: 10,
            deletions: 3,
            review_decision: Some("APPROVED".to_string()),
            url: "https://github.com/Priyans-hu/commandeck/pull/42".to_string(),
            author: "Priyans-hu".to_string(),
            head_ref: "feat/login".to_string(),
            base_ref: "main".to_string(),
            is_draft: false,
        };

        let json = serde_json::to_string(&pr).expect("serialize PullRequest");
        let deserialized: PullRequest =
            serde_json::from_str(&json).expect("deserialize PullRequest");

        assert_eq!(deserialized.id, "PR_123");
        assert_eq!(deserialized.title, "Fix login bug");
        assert_eq!(deserialized.number, 42);
        assert_eq!(deserialized.repo_name, "commandeck");
        assert_eq!(deserialized.repo_owner, "Priyans-hu");
        assert_eq!(deserialized.state, "OPEN");
        assert_eq!(deserialized.additions, 10);
        assert_eq!(deserialized.deletions, 3);
        assert_eq!(deserialized.review_decision, Some("APPROVED".to_string()));
        assert_eq!(deserialized.author, "Priyans-hu");
        assert_eq!(deserialized.head_ref, "feat/login");
        assert_eq!(deserialized.base_ref, "main");
        assert!(!deserialized.is_draft);
    }

    #[test]
    fn pull_request_optional_review_decision_none() {
        let pr = PullRequest {
            id: "PR_456".to_string(),
            title: "WIP".to_string(),
            number: 1,
            repo_name: "repo".to_string(),
            repo_owner: "owner".to_string(),
            state: "OPEN".to_string(),
            created_at: "2026-01-01T00:00:00Z".to_string(),
            updated_at: "2026-01-01T00:00:00Z".to_string(),
            additions: 0,
            deletions: 0,
            review_decision: None,
            url: "https://github.com/owner/repo/pull/1".to_string(),
            author: "dev".to_string(),
            head_ref: "feat/x".to_string(),
            base_ref: "main".to_string(),
            is_draft: true,
        };

        let json = serde_json::to_string(&pr).unwrap();
        let deserialized: PullRequest = serde_json::from_str(&json).unwrap();
        assert!(deserialized.review_decision.is_none());
        assert!(deserialized.is_draft);
    }

    #[test]
    fn pr_file_change_serialization() {
        let file = PrFileChange {
            filename: "src/main.rs".to_string(),
            status: "modified".to_string(),
            additions: 5,
            deletions: 2,
            patch: Some("@@ -1,3 +1,6 @@\n+new line".to_string()),
        };

        let json = serde_json::to_string(&file).expect("serialize PrFileChange");
        let deserialized: PrFileChange =
            serde_json::from_str(&json).expect("deserialize PrFileChange");

        assert_eq!(deserialized.filename, "src/main.rs");
        assert_eq!(deserialized.status, "modified");
        assert_eq!(deserialized.additions, 5);
        assert_eq!(deserialized.deletions, 2);
        assert!(deserialized.patch.is_some());
    }

    #[test]
    fn pr_file_change_patch_none() {
        let file = PrFileChange {
            filename: "binary.png".to_string(),
            status: "added".to_string(),
            additions: 0,
            deletions: 0,
            patch: None,
        };

        let json = serde_json::to_string(&file).unwrap();
        let deserialized: PrFileChange = serde_json::from_str(&json).unwrap();
        assert!(deserialized.patch.is_none());
    }

    #[tokio::test]
    async fn fetch_pull_requests_empty_token_fails() {
        let result = fetch_pull_requests("".to_string(), "testuser".to_string()).await;
        // With an empty token, the GitHub API call will fail (network or auth error)
        // We just verify it returns an Err
        assert!(result.is_err());
    }

    #[test]
    fn graphql_query_contains_expected_fields() {
        let username = "testuser";
        let query = format!(
            r#"
            query {{
              search(query: "is:pr is:open author:{username} sort:updated-desc", type: ISSUE, first: 50) {{
                nodes {{
                  ... on PullRequest {{
                    id
                    title
                    number
                    repository {{
                      name
                      owner {{ login }}
                    }}
                    state
                    createdAt
                    updatedAt
                    additions
                    deletions
                    reviewDecision
                    url
                    author {{ login }}
                    headRefName
                    baseRefName
                    isDraft
                  }}
                }}
              }}
            }}
            "#,
            username = username
        );

        assert!(query.contains("is:pr"));
        assert!(query.contains("is:open"));
        assert!(query.contains("author:testuser"));
        assert!(query.contains("reviewDecision"));
        assert!(query.contains("headRefName"));
        assert!(query.contains("baseRefName"));
        assert!(query.contains("isDraft"));
        assert!(query.contains("additions"));
        assert!(query.contains("deletions"));
        assert!(query.contains("repository"));
    }
}
