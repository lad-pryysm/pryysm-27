
"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Layers, Loader2, Eye, EyeOff, UserCheck, LogIn } from 'lucide-react'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'

export default function LoginPage() {
    const router = useRouter();
    const { loginWithEmail } = useAuth();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isDemoLoading, setIsDemoLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const success = await loginWithEmail(email, password);

        if (success) {
            toast({
                title: 'Login Successful',
                description: 'Welcome back!',
            });
            // The router push is handled inside the login function
        } else {
            toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: 'Invalid email or password. Please try again.',
            });
            setIsLoading(false);
        }
    }
    
    const handleDemoLogin = async () => {
        setIsDemoLoading(true);
        const success = await loginWithEmail('demo@prysm.com', 'demo123');
        if (success) {
            toast({
                title: 'Welcome, Demo User!',
                description: 'You are now exploring the app with sample data.',
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Demo Login Failed',
                description: 'Could not sign in as demo user. Please try again.',
            });
            setIsDemoLoading(false);
        }
    }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-muted/40 p-4">
        <div className="w-full max-w-sm">
            <div className="flex flex-col items-center justify-center mb-8">
                <Link href="/" className="flex items-center justify-center mb-4" prefetch={false}>
                    <div className="h-14 w-14 flex items-center justify-center rounded-lg bg-white text-accent border shadow-sm">
                        <Layers className="h-8 w-8 text-yellow-500" />
                    </div>
                </Link>
                <h1 className="text-2xl font-bold text-primary">
                    Welcome to Pryysm
                </h1>
                 <p className="text-sm text-muted-foreground mt-2">by 3D Prodigy</p>
            </div>
            
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Sign In</CardTitle>
                    <CardDescription>Access your 3D printing farm dashboard.</CardDescription>
                </CardHeader>
                <CardContent>
                   <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="m@example.com"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                         <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            <Link
                              href="#"
                              className="ml-auto inline-block text-sm text-muted-foreground hover:text-primary underline"
                            >
                              Forgot password?
                            </Link>
                          </div>
                          <div className="relative">
                              <Input 
                                  id="password" 
                                  type={showPassword ? "text" : "password"} 
                                  required 
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                              />
                               <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground"
                              >
                                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                          </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading || isDemoLoading}>
                         {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                          Sign in
                        </Button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>

                    <Button variant="secondary" type="button" className="w-full" onClick={handleDemoLogin} disabled={isLoading || isDemoLoading}>
                        {isDemoLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserCheck className="mr-2 h-4 w-4" />}
                        Sign in as Demo User
                    </Button>
                </CardContent>
                <CardFooter className="flex-col gap-4 text-center">
                </CardFooter>
            </Card>
        </div>
         <p className="text-center text-sm text-muted-foreground mt-8">
            &copy; {new Date().getFullYear()} Pryysm by 3D Prodigy.
        </p>
    </div>
  )
}
