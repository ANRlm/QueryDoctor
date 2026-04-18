import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'

const navLinks = [
    { to: '/#features', label: '功能' },
    { to: '/history', label: '历史' },
    { to: '/#diagnose', label: '诊断' },
]

export function Navigation() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const { username, logout } = useAuthStore()
    const navigate = useNavigate()

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    function handleLogout() {
        logout()
        navigate('/')
    }

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
                isScrolled
                    ? 'bg-black/90 backdrop-blur-md border-b border-[#222]'
                    : 'bg-transparent'
            }`}
        >
            <div className="max-w-5xl mx-auto px-6">
                <div className="flex items-center justify-between h-14">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-white rounded flex items-center justify-center">
                            <span className="text-black font-mono text-xs font-bold">Q</span>
                        </div>
                        <span className="text-white font-medium text-sm">QueryDoctor</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className="text-sm text-[#888] hover:text-white transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                        {username ? (
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-[#aaa]">{username}</span>
                                <button
                                    onClick={handleLogout}
                                    className="px-3 py-1.5 border border-[#444] text-[#aaa] text-sm rounded hover:text-white hover:border-[#666] transition-colors"
                                >
                                    退出
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="px-4 py-1.5 bg-white text-black text-sm font-medium rounded hover:bg-[#e5e5e5] transition-colors"
                            >
                                登录
                            </Link>
                        )}
                    </div>

                    <button
                        className="md:hidden p-1 text-white"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {isMobileMenuOpen && (
                <div className="md:hidden bg-black border-t border-[#222]">
                    <div className="px-4 py-4 space-y-3">
                        {navLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className="block py-2 text-sm text-[#888] hover:text-white"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        {username ? (
                            <>
                                <span className="block py-2 text-sm text-[#666]">{username}</span>
                                <button
                                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false) }}
                                    className="block py-2 text-sm text-[#888] hover:text-white"
                                >
                                    退出登录
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className="block py-2 text-sm text-white font-medium"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                登录
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}
