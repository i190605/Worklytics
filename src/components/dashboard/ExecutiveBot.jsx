import { memo, useMemo, useState } from 'react'
import { companyProfile } from '../../data/companyProfile'

function buildReply(input) {
  const text = input.toLowerCase()

  if (text.includes('company') || text.includes('name')) {
    return `Our company name is ${companyProfile.name}.`
  }

  if (text.includes('mission')) {
    return companyProfile.mission
  }

  if (text.includes('offer') || text.includes('service') || text.includes('product')) {
    return `We offer: ${companyProfile.offerings.join(', ')}.`
  }

  if (text.includes('where') || text.includes('headquarter') || text.includes('location')) {
    return `We are based in ${companyProfile.headquarters}.`
  }

  if (text.includes('customer') || text.includes('client')) {
    return `Our main audience: ${companyProfile.targetCustomers}.`
  }

  return `I'm Executive Bot. You can ask me about company name, mission, services, location, and target customers.`
}

function ExecutiveBotBase() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [chat, setChat] = useState([
    {
      sender: 'bot',
      text: `Hi! I’m Executive Bot. Ask me about ${companyProfile.name}.`,
    },
  ])

  const canSend = useMemo(() => message.trim().length > 0, [message])

  const handleSend = () => {
    const input = message.trim()
    if (!input) return

    const reply = buildReply(input)
    setChat((prev) => [...prev, { sender: 'user', text: input }, { sender: 'bot', text: reply }])
    setMessage('')
  }

  return (
    <div className="exec-bot-widget">
      <button
        type="button"
        className="exec-bot-launcher"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        🤖 Executive Bot
      </button>

      {open ? (
        <section className="exec-bot-popup" role="dialog" aria-label="Executive Bot Chat">
          <header className="exec-bot-head">
            <div>
              <h3>Executive Bot</h3>
              <p>{companyProfile.tagline}</p>
            </div>
            <button type="button" className="copilot-close-btn" onClick={() => setOpen(false)}>
              ✕
            </button>
          </header>

          <div className="exec-bot-messages">
            {chat.map((item, idx) => (
              <p key={`${item.sender}-${idx}`} className={`exec-msg ${item.sender}`}>
                {item.text}
              </p>
            ))}
          </div>

          <div className="exec-bot-input-row">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about company..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend()
              }}
            />
            <button type="button" className="mini-btn approve" onClick={handleSend} disabled={!canSend}>
              Send
            </button>
          </div>
        </section>
      ) : null}
    </div>
  )
}

export const ExecutiveBot = memo(ExecutiveBotBase)
