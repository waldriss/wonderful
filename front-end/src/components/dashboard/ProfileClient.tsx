"use client";

import { useSession } from "@/lib/auth";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface ProfileClientProps {
  initialSession: any;
}

// Profile form schema
const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileClient({ initialSession }: ProfileClientProps) {
  // Use the session hook with initialData for hydration
  const { data: session } = useSession();
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = session?.user;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  const onSubmit = async (values: ProfileFormValues) => {
    setIsSubmitting(true);
    
    // Simulating an API call to update profile
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    console.log("Profile update values:", values);
    setIsSubmitting(false);
    
    // Here you would actually call your API to update the profile
    // await updateProfile(values);
  };
  
  // Get user initials for avatar fallback
  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Profile Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Your name" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Your email address" 
                          type="email" 
                          {...field} 
                          disabled // Email is typically not editable
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>
              Update your profile image
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Avatar className="h-32 w-32">
              <AvatarImage src={user?.image || ""} alt={user?.name || "User"} />
              <AvatarFallback className="text-4xl">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Upload New
              </Button>
              <Button variant="outline" size="sm">
                Remove
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Recommended: Square image, at least 300x300px
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Account Security</CardTitle>
          <CardDescription>
            Manage your password and security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Change Password</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input type="password" id="currentPassword" placeholder="••••••••" />
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input type="password" id="newPassword" placeholder="••••••••" />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input type="password" id="confirmPassword" placeholder="••••••••" />
              </div>
            </div>
            <Button className="mt-4">Update Password</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
