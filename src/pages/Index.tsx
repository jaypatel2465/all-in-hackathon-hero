import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Users, Clock, Calendar, DollarSign, Shield, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Users,
    title: 'Employee Management',
    description: 'Centralized profiles with role-based access control',
  },
  {
    icon: Clock,
    title: 'Attendance Tracking',
    description: 'Check-in/out with daily and weekly views',
  },
  {
    icon: Calendar,
    title: 'Leave Management',
    description: 'Apply for leave and track approval status',
  },
  {
    icon: DollarSign,
    title: 'Payroll Visibility',
    description: 'View salary breakdowns and payment history',
  },
  {
    icon: Shield,
    title: 'Approval Workflows',
    description: 'Streamlined HR approvals for admins',
  },
];

const Index: React.FC = () => {
  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-primary">
              <Sun className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Dayflow</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button variant="gradient" asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground mb-6">
            <CheckCircle className="h-4 w-4" />
            Streamline your HR operations
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
            Modern HR Management
            <span className="block gradient-primary bg-clip-text text-transparent">
              Made Simple
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Dayflow digitizes and streamlines core HR operations including employee onboarding, 
            attendance tracking, leave management, and payroll visibility.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="gradient" size="xl" asChild>
              <Link to="/signup">
                Start Free Trial
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" size="xl" asChild>
              <Link to="/login">
                View Demo
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Everything you need
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Comprehensive tools to manage your workforce efficiently
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group rounded-2xl bg-card p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground mb-4 transition-transform duration-300 group-hover:scale-110">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="rounded-3xl gradient-primary p-10 lg:p-16 text-center animate-scale-in shadow-primary">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
            Ready to streamline your HR?
          </h2>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto mb-8">
            Join thousands of companies already using Dayflow to manage their workforce.
          </p>
          <Button size="xl" className="bg-white text-primary hover:bg-white/90" asChild>
            <Link to="/signup">
              Get Started Today
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                <Sun className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">Dayflow</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Dayflow. Built for modern HR teams.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
