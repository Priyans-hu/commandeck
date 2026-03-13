import { useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { useSettingsStore } from '../../stores/settingsStore'
import { Layers, Github, CheckCircle2, ArrowRight, ArrowLeft, Loader2, AlertCircle } from 'lucide-react'

const steps = ['Welcome', 'Connections', 'Done']

export default function OnboardingWizard() {
  const {
    setGithubToken,
    setGithubUsername,
    setLinearApiKey,
    setOnboardingCompleted,
    setConnection,
  } = useSettingsStore()

  const [step, setStep] = useState(0)
  const [githubToken, setLocalGithubToken] = useState('')
  const [githubUsername, setLocalGithubUsername] = useState('')
  const [linearApiKey, setLocalLinearApiKey] = useState('')
  const [testingGithub, setTestingGithub] = useState(false)
  const [testingLinear, setTestingLinear] = useState(false)
  const [githubOk, setGithubOk] = useState(false)
  const [linearOk, setLinearOk] = useState(false)
  const [githubError, setGithubError] = useState('')
  const [linearError, setLinearError] = useState('')
  const [showGithubToken, setShowGithubToken] = useState(false)
  const [showLinearKey, setShowLinearKey] = useState(false)

  const testGithubConnection = async () => {
    setTestingGithub(true)
    setGithubError('')
    setGithubOk(false)
    try {
      await invoke('fetch_pull_requests', { token: githubToken, username: githubUsername })
      setGithubOk(true)
    } catch (err) {
      setGithubError(err instanceof Error ? err.message : String(err))
    } finally {
      setTestingGithub(false)
    }
  }

  const testLinearConnection = async () => {
    setTestingLinear(true)
    setLinearError('')
    setLinearOk(false)
    try {
      await invoke('fetch_teams', { apiKey: linearApiKey })
      setLinearOk(true)
    } catch (err) {
      setLinearError(err instanceof Error ? err.message : String(err))
    } finally {
      setTestingLinear(false)
    }
  }

  const handleComplete = () => {
    if (githubToken) setGithubToken(githubToken)
    if (githubUsername) setGithubUsername(githubUsername)
    if (linearApiKey) setLinearApiKey(linearApiKey)
    if (githubOk) setConnection('github', 'connected')
    if (linearOk) setConnection('linear', 'connected')
    setOnboardingCompleted(true)
  }

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1))
  const back = () => setStep((s) => Math.max(s - 1, 0))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-surface-secondary p-8">
        {/* Step indicator dots */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === step ? 'bg-accent' : 'bg-surface-hover'
              }`}
            />
          ))}
        </div>

        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
              <Layers className="h-8 w-8 text-accent" />
            </div>
            <h1 className="mb-3 text-2xl font-bold text-text-primary">
              Welcome to CommanDeck
            </h1>
            <p className="mb-8 text-text-secondary">
              Your unified work dashboard. Connect your tools to get started.
            </p>
            <button
              onClick={next}
              className="flex items-center gap-2 rounded-lg bg-accent px-6 py-3 font-medium text-white transition-opacity hover:opacity-90"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step 1: Connections */}
        {step === 1 && (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h2 className="mb-1 text-xl font-bold text-text-primary">
                Connect Your Tools
              </h2>
              <p className="text-sm text-text-secondary">
                Link your accounts to pull in data. You can skip and do this later.
              </p>
            </div>

            {/* GitHub Section */}
            <div className="rounded-xl border border-border bg-surface p-4">
              <div className="mb-3 flex items-center gap-2">
                <Github className="h-5 w-5 text-text-primary" />
                <span className="font-medium text-text-primary">GitHub</span>
                {githubOk && <CheckCircle2 className="ml-auto h-5 w-5 text-green-500" />}
                {githubError && <AlertCircle className="ml-auto h-5 w-5 text-red-500" />}
              </div>
              <div className="mb-2 flex flex-col gap-2">
                <div className="relative">
                  <input
                    type={showGithubToken ? 'text' : 'password'}
                    placeholder="GitHub Token"
                    value={githubToken}
                    onChange={(e) => {
                      setLocalGithubToken(e.target.value)
                      setGithubOk(false)
                      setGithubError('')
                    }}
                    className="w-full rounded-lg border border-border bg-surface-secondary px-3 py-2 pr-16 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGithubToken((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-text-secondary hover:text-text-primary"
                  >
                    {showGithubToken ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="GitHub Username"
                  value={githubUsername}
                  onChange={(e) => {
                    setLocalGithubUsername(e.target.value)
                    setGithubOk(false)
                    setGithubError('')
                  }}
                  className="w-full rounded-lg border border-border bg-surface-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none"
                />
              </div>
              {githubError && (
                <p className="mb-2 text-xs text-red-500">{githubError}</p>
              )}
              <button
                onClick={testGithubConnection}
                disabled={testingGithub || !githubToken || !githubUsername}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {testingGithub ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : null}
                Test Connection
              </button>
            </div>

            {/* Linear Section */}
            <div className="rounded-xl border border-border bg-surface p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded text-xs font-bold text-text-primary">
                  L
                </span>
                <span className="font-medium text-text-primary">Linear</span>
                {linearOk && <CheckCircle2 className="ml-auto h-5 w-5 text-green-500" />}
                {linearError && <AlertCircle className="ml-auto h-5 w-5 text-red-500" />}
              </div>
              <div className="mb-2">
                <div className="relative">
                  <input
                    type={showLinearKey ? 'text' : 'password'}
                    placeholder="Linear API Key"
                    value={linearApiKey}
                    onChange={(e) => {
                      setLocalLinearApiKey(e.target.value)
                      setLinearOk(false)
                      setLinearError('')
                    }}
                    className="w-full rounded-lg border border-border bg-surface-secondary px-3 py-2 pr-16 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLinearKey((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-text-secondary hover:text-text-primary"
                  >
                    {showLinearKey ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              {linearError && (
                <p className="mb-2 text-xs text-red-500">{linearError}</p>
              )}
              <button
                onClick={testLinearConnection}
                disabled={testingLinear || !linearApiKey}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {testingLinear ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : null}
                Test Connection
              </button>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={back}
                className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                onClick={next}
                className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Done */}
        {step === 2 && (
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-text-primary">
              You're all set!
            </h2>
            <p className="mb-8 text-text-secondary">
              {githubOk || linearOk
                ? 'Your connections are configured. You can manage them anytime in Settings.'
                : 'You can connect your tools later from Settings.'}
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={back}
                className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                onClick={handleComplete}
                className="flex items-center gap-2 rounded-lg bg-accent px-6 py-3 font-medium text-white transition-opacity hover:opacity-90"
              >
                Start using CommanDeck
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
