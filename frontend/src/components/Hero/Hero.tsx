import { motion } from 'framer-motion'
import { Button } from '../ui/Button'

export function Hero() {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto text-center"
      >
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
          数据库诊断
        </h1>

        <p className="text-lg text-[#888] max-w-xl mx-auto mb-10">
          智能分析慢查询，自动生成优化建议，让您的数据库性能提升 10 倍
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" className="w-full sm:w-auto">
            开始使用
          </Button>
          <Button variant="secondary" size="lg" className="w-full sm:w-auto">
            查看文档
          </Button>
        </div>

        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto text-left">
          {[
            { title: '多数据库', desc: 'MySQL、PostgreSQL、MongoDB、Redis' },
            { title: '实时分析', desc: '秒级响应，即时获取诊断结果' },
            { title: '安全可靠', desc: '本地分析，数据不外传' },
          ].map((item) => (
            <div key={item.title} className="p-5 border border-[#222] rounded">
              <h3 className="text-white font-medium text-sm mb-1">{item.title}</h3>
              <p className="text-[#666] text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
