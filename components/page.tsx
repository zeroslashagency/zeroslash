import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// Simple inline components for the showcase
function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-20 left-10 w-1 h-1 bg-slate-300/30 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
      <div className="absolute top-40 right-20 w-1.5 h-1.5 bg-slate-400/20 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-40 left-20 w-1 h-1 bg-slate-300/25 rounded-full animate-pulse" style={{ animationDelay: '4s' }}></div>
    </div>
  );
}

function GradientText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  );
}

function AnimatedCard({ children, delay = 0, className = "" }: { 
  children: React.ReactNode; 
  delay?: number; 
  className?: string;
}) {
  return (
    <div 
      className={`animate-fade-up ${className}`} 
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function ComponentsShowcase() {
  return (
    <div className="relative">
      <FloatingElements />
      <main className="container mx-auto py-10 px-4 relative z-10">
        <div className="text-center mb-12 animate-fade-up">
          <h1 className="text-5xl font-bold mb-4">
            <GradientText>Shadcn UI</GradientText> Components
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Explore our enhanced collection of beautiful, animated UI components built with shadcn/ui.
          </p>
        </div>
        
        <section className="mb-16">
          <h2 className="text-3xl font-semibold mb-8 text-center">
            <GradientText>Navigation</GradientText>
          </h2>
          <div className="flex justify-center animate-fade-up" style={{ animationDelay: '200ms' }}>
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Getting Started</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="p-6 w-[400px]">
                      <h3 className="text-lg font-medium mb-2">Getting Started</h3>
                      <p className="text-sm text-muted-foreground mb-4">Learn how to use our components and build your application.</p>
                      <div className="grid grid-cols-2 gap-4">
                        <NavigationMenuLink asChild>
                          <a href="#" className="block p-4 rounded-md hover:bg-accent">
                            <h4 className="text-sm font-medium mb-1">Introduction</h4>
                            <p className="text-xs text-muted-foreground">Learn the basics of our components.</p>
                          </a>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <a href="#" className="block p-4 rounded-md hover:bg-accent">
                            <h4 className="text-sm font-medium mb-1">Installation</h4>
                            <p className="text-xs text-muted-foreground">How to install and set up the components.</p>
                          </a>
                        </NavigationMenuLink>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Components</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="p-6 w-[400px]">
                      <h3 className="text-lg font-medium mb-2">Components</h3>
                      <p className="text-sm text-muted-foreground mb-4">Explore our collection of UI components.</p>
                      <div className="grid grid-cols-2 gap-4">
                        <NavigationMenuLink asChild>
                          <a href="#" className="block p-4 rounded-md hover:bg-accent">
                            <h4 className="text-sm font-medium mb-1">Buttons</h4>
                            <p className="text-xs text-muted-foreground">Button components for actions.</p>
                          </a>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <a href="#" className="block p-4 rounded-md hover:bg-accent">
                            <h4 className="text-sm font-medium mb-1">Cards</h4>
                            <p className="text-xs text-muted-foreground">Card components for content.</p>
                          </a>
                        </NavigationMenuLink>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink href="#" className="block py-2 px-4">
                    Documentation
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </section>
        
        <Separator className="my-12 bg-gradient-to-r from-purple-500 to-pink-500 h-px" />
        
        <section className="mb-16">
          <h2 className="text-3xl font-semibold mb-8 text-center">
            <GradientText>Buttons</GradientText>
          </h2>
          <div className="flex flex-wrap justify-center gap-4 animate-fade-up" style={{ animationDelay: '200ms' }}>
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              Gradient
            </Button>
          </div>
        </section>
        
        <section className="mb-16">
          <h2 className="text-3xl font-semibold mb-8 text-center">
            <GradientText>Cards</GradientText>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatedCard delay={0}>
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-white text-xl">📝</span>
                  </div>
                  <CardTitle>Basic Card</CardTitle>
                  <CardDescription>A simple card component</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Card content goes here. This is a basic card component from Shadcn UI with enhanced styling.</p>
                </CardContent>
                <CardFooter>
                  <Button>Action</Button>
                </CardFooter>
              </Card>
            </AnimatedCard>
            
            <AnimatedCard delay={200}>
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-white text-xl">⭐</span>
                  </div>
                  <CardTitle>Feature Card</CardTitle>
                  <CardDescription>Highlighting a key feature</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>This card highlights an important feature of your application with beautiful gradients and animations.</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Cancel</Button>
                  <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">Continue</Button>
                </CardFooter>
              </Card>
            </AnimatedCard>
            
            <AnimatedCard delay={400}>
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-white text-xl">💎</span>
                  </div>
                  <CardTitle>Pricing Card</CardTitle>
                  <CardDescription>Professional Plan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <p className="text-4xl font-bold">
                      <GradientText>$29</GradientText>
                    </p>
                    <p className="text-sm text-muted-foreground">per month</p>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mr-3"></span>
                      <span>Feature one</span>
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mr-3"></span>
                      <span>Feature two</span>
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mr-3"></span>
                      <span>Feature three</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                    Subscribe
                  </Button>
                </CardFooter>
              </Card>
            </AnimatedCard>
          </div>
        </section>
        
        <section className="mb-16">
          <h2 className="text-3xl font-semibold mb-8 text-center">
            <GradientText>Form Elements</GradientText>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AnimatedCard delay={0}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white text-sm">📝</span>
                    </div>
                    Input Fields
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <Input placeholder="Enter your name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input type="email" placeholder="Enter your email" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Password</label>
                    <Input type="password" placeholder="Enter your password" />
                  </div>
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    Submit
                  </Button>
                </CardContent>
              </Card>
            </AnimatedCard>
            
            <AnimatedCard delay={200}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white text-sm">📋</span>
                    </div>
                    Tabs Example
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="account">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="account">Account</TabsTrigger>
                      <TabsTrigger value="password">Password</TabsTrigger>
                    </TabsList>
                    <TabsContent value="account" className="p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Username</label>
                        <Input placeholder="@username" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <Input type="email" placeholder="m@example.com" />
                      </div>
                      <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                        Save Changes
                      </Button>
                    </TabsContent>
                    <TabsContent value="password" className="p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Current Password</label>
                        <Input type="password" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">New Password</label>
                        <Input type="password" />
                      </div>
                      <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                        Change Password
                      </Button>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </AnimatedCard>
          </div>
        </section>
        
        <section className="mb-16">
          <h2 className="text-3xl font-semibold mb-8 text-center">
            <GradientText>Badges</GradientText>
          </h2>
          <div className="flex flex-wrap justify-center gap-4 animate-fade-up" style={{ animationDelay: '200ms' }}>
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              Gradient
            </Badge>
            <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
              Ocean
            </Badge>
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
              Nature
            </Badge>
          </div>
        </section>
      </main>
    </div>
  )
}
