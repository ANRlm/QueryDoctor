import { motion } from 'framer-motion'
import { Button } from '../ui/Button'
import { ArrowRight, Database, Zap, Shield } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
}

const iconVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'backOut' as const,
    },
  },
}

export function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-black to-purple-950/10" />
      <div className="absolute inset-0 animate-gradient bg-[length:200%_200%] bg-gradient-to-r from-blue-600/20 via-purple-600/10 to-blue-600/20" />
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        <motion.div variants={iconVariants} className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm">
            <Zap size={14} />
            <span>AI-Powered Database Diagnostics</span>
          </div>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <span className="text-white">智能 </span>
          <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            数据库诊断
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10"
        >
          自动分析慢查询、生成优化建议、支持多种数据库，
          <br className="hidden sm:block" />
          让您的数据库性能提升 10 倍
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="group">
            开始诊断
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="secondary" size="lg">
            查看文档
          </Button>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            {
              icon: Database,
              title: '多数据库支持',
              desc: 'MySQL、PostgreSQL、MongoDB、Redis',
            },
            {
              icon: Zap,
              title: '实时分析',
              desc: '秒级响应，即时获取诊断结果',
            },
            {
              icon: Shield,
              title: '安全可靠',
              desc: '本地分析，数据不外传',
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all"
            >
              <feature.icon className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-400">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2"
        >
          <motion.div className="w-1 h-2 bg-white/50 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  )
}
