import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { AppPreview } from "@/components/landing/app-preview";
import { Bot, Zap, Globe, Wrench, Database, KeyRound, ArrowRight, Check } from "lucide-react";

const features = [
  { icon: Bot, title: "Agent 管理", description: "创建/编辑/删除 Agent，自定义系统提示词与模型参数，按场景精细化配置。" },
  { icon: Zap, title: "流式对话", description: "实时流式响应，支持中途停止生成，多轮上下文与历史回溯。" },
  { icon: Globe, title: "工具调用", description: "Agent 可自动调用内置工具：网页搜索、网络请求，或自定义 HTTP API。" },
  { icon: Wrench, title: "自定义工具", description: "可视化参数编辑器，无需手写 JSON Schema，快速接入自有服务。" },
  { icon: Database, title: "知识库 RAG", description: "上传文档自动分块向量化，Agent 绑定知识库后检索作答并标注来源。" },
  { icon: KeyRound, title: "多用户认证", description: "邮箱 + 密码登录，自研 JWT + refresh token 轮换，数据按用户隔离。" },
];

const steps = [
  { step: "1", title: "创建 Agent", description: "填写名称与系统提示词，选择模型" },
  { step: "2", title: "配置能力", description: "勾选内置工具、绑定知识库、接入自定义 API" },
  { step: "3", title: "开始对话", description: "流式对话，随时调整参数继续优化" },
];

export function Landing() {
  const navigate = useNavigate();
  const { allowSignup } = useAuth();

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* 导航栏 */}
      <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-neutral-900" />
            <span className="text-base font-semibold">AI Agent Platform</span>
          </Link>
          <div className="flex items-center gap-2">
            {allowSignup && (
              <Button variant="outline" onClick={() => navigate("/signup")}>注册</Button>
            )}
            <Button onClick={() => navigate("/login")}>登录</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 text-center">
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
          创建属于你的 AI Agent
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-neutral-500">
          通过 Web UI 创建、配置 Agent，赋予工具调用与知识库检索能力，与 DeepSeek 模型实时流式对话。
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button size="lg" onClick={() => navigate("/login")}>
            立即体验 <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
          {allowSignup && (
            <Button size="lg" variant="outline" onClick={() => navigate("/signup")}>免费注册</Button>
          )}
        </div>
      </section>

      {/* 产品界面示意 */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <AppPreview />
      </section>

      {/* 特性区 */}
      <section className="border-t border-neutral-100 bg-neutral-50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-center text-3xl font-bold">核心能力</h2>
          <p className="mt-3 text-center text-neutral-500">从对话到工具调用，一站式搞定</p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100">
                  <Icon className="h-5 w-5 text-neutral-700" />
                </div>
                <h3 className="mb-2 text-base font-semibold">{title}</h3>
                <p className="text-sm leading-relaxed text-neutral-500">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 三步流程 */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold">三步开始使用</h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {steps.map(({ step, title, description }) => (
            <div key={step} className="relative text-center">
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white">
                {step}
              </div>
              <h3 className="mb-1.5 text-base font-semibold">{title}</h3>
              <p className="text-sm text-neutral-500">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 底部 CTA */}
      <section className="border-t border-neutral-100 bg-neutral-900">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center text-white">
          <h2 className="text-3xl font-bold">准备好开始了吗？</h2>
          <p className="mt-3 text-neutral-400">注册账号，几分钟内创建你的第一个 Agent</p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button size="lg" variant="secondary" onClick={() => navigate("/login")}>
              登录 <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            {allowSignup && (
              <Button size="lg" variant="outline" className="border-neutral-600 bg-transparent text-white hover:bg-neutral-800" onClick={() => navigate("/signup")}>
                <Check className="mr-1 h-4 w-4" />免费注册
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="bg-neutral-900 pb-8">
        <div className="mx-auto max-w-6xl px-6 pt-8 text-center">
          <div className="flex flex-col items-center justify-center gap-3 text-sm text-neutral-400 sm:flex-row sm:gap-6">
            <span>联系作者：</span>
            <a href="mailto:ljh6c6a68@gmail.com" className="hover:text-white">
              ljh6c6a68@gmail.com
            </a>
            <a href="https://x.com/selfhacker513" target="_blank" rel="noopener noreferrer" className="hover:text-white">
              @selfhacker513
            </a>
            <a href="https://github.com/selfhacker" target="_blank" rel="noopener noreferrer" className="hover:text-white">
              github.com/selfhacker
            </a>
          </div>
          <div className="pt-4 text-center text-sm text-neutral-500">
            © {new Date().getFullYear()} Simple AI Agent Platform
          </div>
        </div>
      </footer>
    </div>
  );
}
