'use client'

interface PasswordStrengthProps {
  password: string
}

function getStrength(password: string): { score: number; label: string; color: string } {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  if (score <= 1) return { score, label: 'Faible', color: 'bg-red-500' }
  if (score <= 2) return { score, label: 'Moyen', color: 'bg-amber-500' }
  if (score <= 3) return { score, label: 'Bon', color: 'bg-blue-500' }
  return { score, label: 'Excellent', color: 'bg-emerald-500' }
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null
  const { score, label, color } = getStrength(password)

  return (
    <div className="space-y-1.5 mt-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= score ? color : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-slate-500">
        Solidité : <span className="font-medium">{label}</span>
      </p>
    </div>
  )
}
