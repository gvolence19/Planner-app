import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Lightbulb, Send, CheckCircle, MessageSquare, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface SupportFormData {
  name: string;
  email: string;
  category: string;
  subject: string;
  description: string;
}

export default function HelpSupport() {
  const navigate = useNavigate();
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

    try {
      // TODO: Replace this with your actual backend endpoint
      // This should send to your email address via your backend
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          type: activeTab, // 'issue' or 'feature'
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }
      
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
      console.error('Submission error:', error);
      toast.error('Failed to submit. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const issueCategories = [
    'Bug Report',
    'Performance Issue',
    'Login/Authentication',
    'Data Sync Problem',
    'UI/Display Issue',
    'Other Technical Issue'
  ];

  const featureCategories = [
    'New Feature Request',
    'Improvement Suggestion',
    'Integration Request',
    'UI/UX Enhancement',
    'Other Suggestion'
  ];

  const categories = activeTab === 'issue' ? issueCategories : featureCategories;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Tasks
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Help & Support</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">How can we help you?</h2>
            <p className="text-muted-foreground">
              Report issues or suggest new features to improve your experience.
            </p>
          </div>

          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  You'll receive updates via email
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
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="issue" className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Report Issue
                  </TabsTrigger>
                  <TabsTrigger value="feature" className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Suggest Feature
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="issue" className="space-y-4">
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-red-900 dark:text-red-100">Reporting an Issue</h3>
                        <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                          Please describe the problem you're experiencing in detail. Include any error messages or steps to reproduce the issue.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="feature" className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex gap-2">
                      <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100">Suggesting a Feature</h3>
                        <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                          We'd love to hear your ideas! Describe the feature you'd like to see and how it would improve your experience.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name *</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Your Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    placeholder={
                      activeTab === 'issue'
                        ? 'Brief description of the issue'
                        : 'Brief description of your feature idea'
                    }
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder={
                      activeTab === 'issue'
                        ? 'Please provide detailed information about the issue...\n\nSteps to reproduce:\n1. \n2. \n3. \n\nExpected behavior:\n\nActual behavior:'
                        : 'Describe your feature suggestion in detail...\n\nWhat problem does it solve?\n\nHow would you like it to work?'
                    }
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={10}
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/')}
                    disabled={isSubmitting}
                  >
                    Cancel
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
                        Submit Request
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">What happens next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <p className="font-medium">1. We receive your request</p>
                  <p className="text-sm text-muted-foreground">
                    Your submission is immediately sent to our support team
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <p className="font-medium">2. We review and prioritize</p>
                  <p className="text-sm text-muted-foreground">
                    Our team will review your request and prioritize accordingly
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <p className="font-medium">3. You receive a response</p>
                  <p className="text-sm text-muted-foreground">
                    We'll contact you via email within 24-48 hours
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}