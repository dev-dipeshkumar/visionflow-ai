import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, unauthenticated } from '@/lib/auth'

export const maxDuration = 30
export const dynamic = 'force-dynamic'

const SYSTEM_PROMPT = `You are VisionFlow AI, an intelligent assistant for an enterprise SaaS platform. You help users with:
- Lead generation and CRM management
- Outreach campaigns and sales automation
- Pipeline analytics and deal insights
- Proposal generation and document creation
- Workflow automation and team reporting
- Revenue analysis and business intelligence

You have access to the user's CRM data, agents, workflows, and analytics. Be concise, actionable, and professional. When users give commands, respond with structured, helpful output. Use markdown formatting for clarity (headers, lists, tables, code blocks where appropriate).`

export async function POST(request: NextRequest) {
  try {
    // Require authentication for chat API
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return unauthenticated('Please sign in to use AI Chat')
    }

    const body = await request.json()
    const { messages, model } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    // Try to use z-ai-web-dev-sdk for real AI response with a timeout
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      const zai = await ZAI.create()

      // Build conversation with system prompt including user context
      const conversationMessages = [
        { role: 'system' as const, content: `${SYSTEM_PROMPT}\n\nCurrent user: ${authUser.name || authUser.email}, Role: ${authUser.role}, Workspace: ${authUser.workspace}, Plan: ${authUser.plan}` },
        ...messages.map((msg: { role: string; content: string }) => ({
          role: msg.role === 'assistant' ? 'assistant' as const : 'user' as const,
          content: msg.content,
        })),
      ]

      // Add a timeout wrapper around the AI call
      const aiPromise = zai.chat.completions.create({
        messages: conversationMessages,
        temperature: 0.7,
        max_tokens: 1024,
      })

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('AI request timed out')), 15000)
      })

      const completion = await Promise.race([aiPromise, timeoutPromise])

      const aiMessage = completion.choices?.[0]?.message?.content

      if (aiMessage) {
        return NextResponse.json({
          message: aiMessage,
          model: model || 'default',
          provider: 'z-ai',
        })
      }
    } catch (aiError: unknown) {
      const errorMessage = aiError instanceof Error ? aiError.message : 'Unknown AI error'
      console.warn('AI SDK call failed, falling back:', errorMessage)

      // Check if it's an API key error
      if (errorMessage.toLowerCase().includes('api key') ||
          errorMessage.toLowerCase().includes('unauthorized') ||
          errorMessage.toLowerCase().includes('authentication')) {
        return NextResponse.json(
          {
            error: 'MISSING_API_KEY',
            message: 'Connect Gemini API in Settings to enable live AI responses.',
          },
          { status: 503 }
        )
      }
    }

    // Fallback: intelligent command-based responses
    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || ''
    const fallbackResponse = generateSmartFallback(lastMessage)

    return NextResponse.json({
      message: fallbackResponse,
      model: model || 'fallback',
      provider: 'fallback',
      isOffline: true,
    })
  } catch (error: unknown) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}

function generateSmartFallback(userMessage: string): string {
  if (userMessage.includes('/find-leads') || userMessage.includes('find lead') || userMessage.includes('new lead')) {
    return "I'll find leads matching your criteria. Searching across available data sources...\n\nOnce I have results, I'll score and enrich them for you. Would you like me to start outreach to the top matches?\n\n**Note**: Connect an AI API key in Settings for real-time intelligent responses with live data access."
  }

  if (userMessage.includes('/generate-proposal') || userMessage.includes('proposal') || userMessage.includes('generate proposal')) {
    return "Generating a personalized proposal based on the information provided...\n\nThe proposal will include recommended setup, pricing, and expected ROI. Shall I export this or schedule a presentation?\n\n**Note**: Connect an AI API key in Settings for real-time intelligent responses."
  }

  if (userMessage.includes('/analyze-pipeline') || userMessage.includes('pipeline') || userMessage.includes('analyze')) {
    return "Analyzing your current pipeline...\n\nI'll review conversion rates by stage, identify bottlenecks, and suggest actions to accelerate deals. Want me to take action on any findings?\n\n**Note**: Connect an AI API key in Settings for real-time intelligent responses."
  }

  if (userMessage.includes('/run-outreach') || userMessage.includes('outreach') || userMessage.includes('campaign')) {
    return "Initiating outreach campaign...\n\nI'll set up a multi-channel sequence with personalized messaging. I'll track all interactions and update the CRM automatically.\n\n**Note**: Connect an AI API key in Settings for real-time intelligent responses."
  }

  if (userMessage.includes('/score-leads') || userMessage.includes('score') || userMessage.includes('target lead')) {
    return "Scoring and prioritizing leads using multi-factor analysis...\n\nI'll evaluate all leads and categorize them by priority. Shall I start outreach to the top-scoring leads?\n\n**Note**: Connect an AI API key in Settings for real-time intelligent responses."
  }

  if (userMessage.includes('/build-workflow') || userMessage.includes('workflow') || userMessage.includes('start workflow')) {
    return "Designing your automated workflow...\n\nI'll create a workflow with appropriate triggers, conditions, and actions. Want me to set this up in the workflow builder?\n\n**Note**: Connect an AI API key in Settings for real-time intelligent responses."
  }

  if (userMessage.includes('/team-report') || userMessage.includes('report') || userMessage.includes('revenue')) {
    return "Generating team performance report...\n\nThe report will include activity metrics, deal progress, and AI agent efficiency. Full report ready for export when complete.\n\n**Note**: Connect an AI API key in Settings for real-time intelligent responses."
  }

  if (userMessage.includes('/summon') || userMessage.includes('agent') || userMessage.includes('summon agent')) {
    return "Summoning AI agent...\n\nThe agent is now active and ready to assist with your request. It will operate autonomously based on your instructions and report back with results.\n\n**Available agents**:\n- Lead Scout: Finds and qualifies new leads\n- Outreach Manager: Runs multi-channel campaigns\n- Deal Analyst: Analyzes pipeline and suggests actions\n- Revenue Tracker: Monitors revenue and forecasts\n\n**Note**: Connect an AI API key in Settings for live agent execution."
  }

  if (userMessage.includes('/help') || userMessage.includes('help') || userMessage.includes('command')) {
    return "Here are all available **AI Commands**:\n\n| Command | Description |\n|---------|-------------|\n| `/find-leads` | Search for new qualified leads |\n| `/generate-proposal` | Create a personalized proposal |\n| `/analyze-pipeline` | Pipeline analytics & insights |\n| `/run-outreach` | Start outreach campaigns |\n| `/score-leads` | Score and prioritize leads |\n| `/build-workflow` | Design automated workflows |\n| `/summon-agent` | Activate an AI agent |\n| `/team-report` | Team performance report |\n| `/help` | Show this help message |\n\nYou can also just type naturally and I'll understand your intent."
  }

  // Default response
  return "I've received your message. I'm currently operating in **offline mode** with pre-configured responses.\n\nTo unlock live AI-powered responses with full access to your CRM data, analytics, and automation capabilities, please connect an AI API key in **Settings**.\n\nIn the meantime, you can use these commands:\n- `/find-leads` - Search for new leads\n- `/analyze-pipeline` - Pipeline analytics\n- `/help` - Show all available commands"
}
