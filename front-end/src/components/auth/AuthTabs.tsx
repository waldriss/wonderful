"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

export default function AuthTabs() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>("login");
  
  // Set the active tab based on URL params
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "register") {
      setActiveTab("register");
    } else {
      setActiveTab("login");
    }
  }, [searchParams]);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="register">Register</TabsTrigger>
      </TabsList>
      <TabsContent value="login" className="mt-4">
        <LoginForm />
      </TabsContent>
      <TabsContent value="register" className="mt-4">
        <SignupForm />
      </TabsContent>
    </Tabs>
  );
}
