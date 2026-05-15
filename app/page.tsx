import Link from "next/link";
import { ArrowRight, Zap, Users, Wallet, Shield, TrendingUp, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero section */}
      <section className="container px-4 py-20 md:py-32">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/50 px-4 py-1.5 text-sm backdrop-blur-sm">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span>Powered by Stellar blockchain</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            Split bills with friends.{" "}
            <span className="gradient-text">Settle instantly.</span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Track shared expenses and settle payments using the Stellar blockchain. Fast, transparent, and secure.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" variant="gradient" className="gap-2 text-base">
              <Link href="/auth/login">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base">
              <Link href="#features">Learn More</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-8 max-w-2xl mx-auto">
            <div className="text-center">
              <p className="text-3xl font-bold gradient-text">$0</p>
              <p className="text-sm text-muted-foreground">Transaction Fees</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold gradient-text">&lt;5s</p>
              <p className="text-sm text-muted-foreground">Settlement Time</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold gradient-text">100%</p>
              <p className="text-sm text-muted-foreground">Transparent</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section id="features" className="container px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold sm:text-4xl">Why StellarSplit?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Modern expense splitting powered by blockchain technology
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Group Expenses"
              description="Create groups for trips, dinners, or shared living. Add expenses and split them equally or custom."
            />
            <FeatureCard
              icon={<Wallet className="h-6 w-6" />}
              title="Instant Settlements"
              description="Pay back friends instantly using XLM or USDC on the Stellar network. No bank delays."
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Secure & Private"
              description="Your data is yours. Payments are secured by the Stellar blockchain's proven infrastructure."
            />
            <FeatureCard
              icon={<TrendingUp className="h-6 w-6" />}
              title="Smart Balances"
              description="Automatically calculates who owes who and simplifies debts to minimize transactions."
            />
            <FeatureCard
              icon={<Globe className="h-6 w-6" />}
              title="Global Payments"
              description="Send money anywhere in the world. No borders, no intermediaries, no hassle."
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="Lightning Fast"
              description="Stellar transactions confirm in 3-5 seconds. Get instant payment confirmations."
            />
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="container px-4 py-20">
        <Card className="mx-auto max-w-4xl border-2 bg-gradient-to-br from-violet-500/10 to-cyan-500/10">
          <CardContent className="p-8 md:p-12 text-center space-y-6">
            <h2 className="text-3xl font-bold sm:text-4xl">Ready to get started?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Join thousands of users splitting expenses the modern way. Create your first group in under a minute.
            </p>
            <Button asChild size="lg" variant="gradient" className="gap-2">
              <Link href="/auth/login">
                Start Splitting <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>Built with Next.js, Stellar SDK, and shadcn/ui</p>
          <p className="mt-2">© 2026 StellarSplit. Open source and free to use.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="transition-all hover:shadow-lg hover:-translate-y-1">
      <CardContent className="p-6 space-y-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}
