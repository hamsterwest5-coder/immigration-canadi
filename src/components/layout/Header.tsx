'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, User, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Accueil' },
  { href: '/programmes', label: 'Nos programmes' },
  { href: '/comment-ca-marche', label: 'Comment ça marche' },
  { href: '/a-propos', label: 'À propos' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-[#c8102e] flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-white font-bold text-lg">CA</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-semibold text-[#0a2540] text-lg leading-tight block">
                Canada Immigration
              </span>
              <span className="text-xs text-slate-500 tracking-wide">
                Accompagnement professionnel
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-[#c8102e] rounded-md hover:bg-slate-50 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0a2540] hover:text-[#c8102e] transition-colors"
            >
              <User className="w-4 h-4" />
              Connexion
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#c8102e] hover:bg-[#9b0c24] rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              Commencer ma demande
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          'lg:hidden border-t border-slate-200 bg-white overflow-hidden transition-all duration-300',
          mobileOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <nav className="px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-[#c8102e] rounded-lg"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <Link
              href="/auth/login"
              className="flex items-center gap-2 px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              onClick={() => setMobileOpen(false)}
            >
              <User className="w-5 h-5" />
              Connexion
            </Link>
            <Link
              href="/auth/register"
              className="flex items-center justify-center gap-2 px-4 py-3 text-base font-semibold text-white bg-[#c8102e] rounded-lg"
              onClick={() => setMobileOpen(false)}
            >
              Commencer ma demande
            </Link>
            <Link
              href="/client/suivi"
              className="flex items-center justify-center gap-2 px-4 py-3 text-base font-medium text-[#0a2540] border border-slate-200 rounded-lg"
              onClick={() => setMobileOpen(false)}
            >
              <FileText className="w-5 h-5" />
              Suivre mon dossier
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
