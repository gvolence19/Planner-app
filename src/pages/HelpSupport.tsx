import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Lightbulb, Send, CheckCircle, Mail, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface SupportFormData {
  name: string;
  email: string;
  category: string;
  subject: string;
  description: string;
}

export default function HelpSupport() {
  const [activeTab, setActiveTab] = useState('issue');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<SupportFormData>({
    name: '',
    email: '',
    category: '',
    subject: '',
    description: ''
  });

  const handleInputChange = (field: keyof SupportFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.category || !formData.subject || !formData.description) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call - replace with your actual endpoint
    try {
      // Example: await fetch('/api/support', { method: 'POST', body: JSON.stringify(formData) });
      
      // For now, just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(
        activeTab === 'issue' 
          ? 'Issue reported successfully! We\'ll get back to you soon.' 
          : 'Feature suggestion submitted! Thank you for your feedback.'
      );
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        category: '',
        subject: '',
        description: ''
      });
    } catch (error) {
      toast.error('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const issueCategories = [
    'Bug Report',
    'Performance Issue',
    'Login/Authentication',
    'Task Management',
    'Calendar Sync',
    'Mobile App',
    'Other'
  ];

  const featureCategories = [
    'Task Management',
    'Calendar Integration',
    'Collaboration',
    'Notifications',
    'UI/UX Improvement',
    'Mobile Features',
    'Other'
  ];

  return (
    <div className="container max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
        <p className="text-muted-foreground">
          We're here to help! Report issues or suggest new features to improve your experience.
        </p>
      </div>

      {/* Quick Help Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-base">Email Support</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">Get help via email</p>
            <a 
              href="mailto:support@taskplanner.com" 
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              support@taskplanner.com
            </a>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-800">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
              <CardTitle className="text-base">Response Time</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              We typically respond within 24-48 hours
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <CardTitle className="text-base">Status Updates</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Track your request via email notifications
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Form */}
      <Card>
        <CardHeader>
          <CardTitle>Submit a Request</CardTitle>
          <CardDescription>
            Choose whether you're reporting an issue or suggesting a feature
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="issue" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Report Issue
              </TabsTrigger>
              <TabsTrigger value="feature" className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Suggest Feature
              </TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <TabsContent value="issue" className="space-y-4 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issue-category">Issue Category *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => handleInputChange('category', value)}
                    required
                  >
                    <SelectTrigger id="issue-category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {issueCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issue-subject">Subject *</Label>
                  <Input
                    id="issue-subject"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    placeholder="Brief description of the issue"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issue-description">Describe the Issue *</Label>
                  <Textarea
                    id="issue-description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Please provide as much detail as possible, including:&#10;- What were you trying to do?&#10;- What actually happened?&#10;- Steps to reproduce the issue&#10;- Any error messages you saw"
                    rows={8}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    The more details you provide, the faster we can help resolve your issue
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="feature" className="space-y-4 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="feature-name">Your Name *</Label>
                    <Input
                      id="feature-name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="feature-email">Email Address *</Label>
                    <Input
                      id="feature-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feature-category">Feature Category *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => handleInputChange('category', value)}
                    required
                  >
                    <SelectTrigger id="feature-category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {featureCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feature-subject">Feature Title *</Label>
                  <Input
                    id="feature-subject"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    placeholder="Brief title for your feature suggestion"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feature-description">Describe Your Feature Idea *</Label>
                  <Textarea
                    id="feature-description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Please describe your feature suggestion:&#10;- What problem would this solve?&#10;- How would it work?&#10;- Who would benefit from this feature?&#10;- Any examples from other apps?"
                    rows={8}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Help us understand your vision and how it would improve the app
                  </p>
                </div>
              </TabsContent>

              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setFormData({
                    name: '',
                    email: '',
                    category: '',
                    subject: '',
                    description: ''
                  })}
                >
                  Clear Form
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit {activeTab === 'issue' ? 'Issue' : 'Suggestion'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Tabs>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">How do I reset my password?</h3>
            <p className="text-sm text-muted-foreground">
              Click on "Forgot Password" on the login page and follow the instructions sent to your email.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Can I sync my calendar with the app?</h3>
            <p className="text-sm text-muted-foreground">
              Yes! Go to Settings and connect your Google Calendar or other supported calendar services.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Is there a mobile app available?</h3>
            <p className="text-sm text-muted-foreground">
              The web app is mobile-responsive. Native iOS and Android apps are coming soon!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}