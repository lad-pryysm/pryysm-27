
'use client';

import { Button } from "@/components/ui/button";
import { Calculator, CheckCircle2, GanttChartSquare, Layers, Workflow, Cpu, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from 'lucide-react';
import { useWorkspace } from "@/hooks/use-workspace";
import { Loader2 } from "lucide-react";
import { aiScheduling, visualWorkflow, financialHub } from "@/app/lib/generated-images";


export default function LandingPage() {
  
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800">
      <header className="px-4 lg:px-6 h-16 flex items-center shadow-sm sticky top-0 z-50 bg-white/80 backdrop-blur-sm">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <Layers className="h-8 w-8 text-yellow-500" />
          <span className="ml-2 text-xl font-bold text-primary">
            Pryysm <span className="text-sm font-medium text-gray-500">by 3D Prodigy</span>
          </span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link href="#features" className="text-sm font-medium hover:text-primary" prefetch={false}>
            Features
          </Link>
          <Link href="#contact" className="text-sm font-medium hover:text-primary" prefetch={false}>
            Contact
          </Link>
          <Button asChild variant="secondary">
            <Link href="https://calendly.com/bhavin-lad-3d-prodigy/pryysm-demo" target="_blank" rel="noopener noreferrer">
              Book Demo
            </Link>
          </Button>
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full pt-24 pb-32 md:pt-32 md:pb-40 text-center overflow-hidden bg-white">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center space-y-6">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl leading-snug bg-clip-text text-transparent bg-gradient-to-br from-gray-900 via-primary to-accent mb-6 pb-2">
                  Revolutionize Your 3D Printing Operation
                </h1>
                
                <p className="max-w-[700px] text-gray-600 md:text-xl mx-auto">
                  Pryysm is the all-in-one, intelligent platform designed to bring clarity, efficiency, and powerful automation to your 3D printing farm.
                </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-gray-900">A Smarter Way to Print</h2>
              <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed">
                From intelligent scheduling to complete financial oversight, Pryysm is the unified OS your 3D printing farm needs to scale efficiently.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-1 md:gap-12 lg:max-w-none lg:grid-cols-3">
              {/* Feature 1: AI Scheduling */}
              <Card className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Cpu className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>AI-Powered Scheduling</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-muted-foreground">
                    Our intelligent AI scheduler analyzes your entire fleet, job requirements, and deadlines to find the absolute optimal production plan.
                  </p>
                  <ul className="mt-4 space-y-3 text-sm">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                      <span>Automatically find the most efficient slot for any job.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                      <span>Maximize printer utilization and reduce idle time.</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Feature 2: Visual Workflow */}
              <Card className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Workflow className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Visual Project Tracking</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-muted-foreground">
                    Ditch confusing spreadsheets. Our intuitive Kanban-style board gives you a complete visual overview of every project in your pipeline.
                  </p>
                  <ul className="mt-4 space-y-3 text-sm">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                      <span>Track projects from order to dispatch in one view.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                      <span>Get instant insights into bottlenecks and resource allocation.</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Feature 3: Financial Hub */}
              <Card className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Integrated Financial Hub</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-muted-foreground">
                    From precise job costing to professional invoicing, Pryysm integrates your finances directly into your workflow to ensure profitability.
                  </p>
                  <ul className="mt-4 space-y-3 text-sm">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                      <span>Calculate exact job costs, including materials and labor.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                      <span>Generate and send professional quotes and invoices in minutes.</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Core Pillars Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-gray-900">The Unified Platform for Manufacturing</h2>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-3">
              <div className="grid gap-2 p-6 rounded-lg hover:bg-gray-100 transition-colors">
                <Workflow className="h-8 w-8 text-primary" />
                <h3 className="text-lg font-bold">Total Workflow Control</h3>
                <p className="text-sm text-gray-600">Manage your entire production pipeline visually. Track every project from order to dispatch on an intuitive Kanban board and eliminate operational blind spots.</p>
              </div>
              <div className="grid gap-2 p-6 rounded-lg hover:bg-gray-100 transition-colors">
                <GanttChartSquare className="h-8 w-8 text-primary" />
                <h3 className="text-lg font-bold">Intelligent Resource Planning</h3>
                <p className="text-sm text-gray-600">Leverage AI to automate scheduling, maximize printer uptime, and receive intelligent reorder alerts for materials before you run out. Turn your farm into a self-optimizing ecosystem.</p>
              </div>
              <div className="grid gap-2 p-6 rounded-lg hover:bg-gray-100 transition-colors">
                <Calculator className="h-8 w-8 text-primary" />
                <h3 className="text-lg font-bold">Integrated Financial Hub</h3>
                <p className="text-sm text-gray-600">From precise job costing that ensures profitability to generating professional quotations and invoices, manage all your finances without leaving the platform.</p>
              </div>
            </div>
          </div>
        </section>

      </main>
      <footer id="contact" className="bg-gray-100 text-gray-600 py-12">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
                <h3 className="font-semibold text-gray-900 mb-4">Pryysm <span className="text-xs font-medium text-gray-500">by 3D Prodigy</span></h3>
                <p className="text-sm">The OS for Digital Manufacturing.</p>
            </div>
             <div>
                <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
                 <ul className="space-y-2 text-sm">
                    <li><Link href="#features" className="hover:text-gray-900">Features</Link></li>
                </ul>
            </div>
            <div>
                <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
                 <ul className="space-y-2 text-sm">
                    <li><Link href="#" className="hover:text-gray-900">About Us</Link></li>
                    <li><Link href="#" className="hover:text-gray-900">Careers</Link></li>
                    <li><Link href="#" className="hover:text-gray-900">Contact</Link></li>
                </ul>
            </div>
             <div>
                <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
                 <ul className="space-y-2 text-sm">
                    <li><Link href="#" className="hover:text-gray-900">Terms of Service</Link></li>
                    <li><Link href="#" className="hover:text-gray-900">Privacy Policy</Link></li>
                </ul>
            </div>
        </div>
        <div className="container mt-12 pt-8 border-t border-gray-200 text-center text-sm">
             &copy; {new Date().getFullYear()} Pryysm by 3D Prodigy. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
