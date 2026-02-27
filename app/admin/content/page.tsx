"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function AdminContentPage() {
  const [heroData, setHeroData] = useState({
    title: "Epic Ink Tattoo",
    address1: "Unit A23, New Horizon Mall",
    address2: "260300 Writing Creek Cres, Balzac, AB T4A 0X8",
    phone: "(780) 286-7773",
  });

  const [whyUsData, setWhyUsData] = useState({
    intro:
      "Welcome to Epic Ink Tattoo, where art meets skin in the most exquisite way. At Epic Ink Tattoo, we believe that tattoos are more than just ink on the skin; they are symbols of individuality, stories of personal journeys, and expressions of inner beauty.",
    closing:
      "Come join us at Epic Ink Tattoo and let your skin tell your story.",
  });

  const [aboutData, setAboutData] = useState({
    studioDescription:
      '"Epic Ink Tattoo" was carefully chosen as the name for Eman\'s tattoo shop to encapsulate the essence of the artistry and experience offered within its walls.',
    artistName: "Eman",
    artistQuote:
      "All you need is passion. If you have a passion for something, you'll create the talent.",
    artistBio:
      "This has been Eman's unwavering mantra ever since he first picked up a tattoo needle. Eman's journey into the world of tattoo artistry began 15 years ago, when he stumbled upon an old tattoo magazine in a dusty corner of a bookstore.",
  });

  const [contactData, setContactData] = useState({
    subtitle: "Fill out the form and we'll get back to you within 48 hours.",
    hours: "Mon - Sat: 10AM - 8PM\nSun: By appointment only",
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
  });

  function handleSave(section: string) {
    toast.success(
      `${section} content saved! (Connect Convex to persist changes)`
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Site Content
        </h1>
        <p className="mt-1 text-muted-foreground">
          Edit the text content displayed on your website.
        </p>
      </div>

      <Tabs defaultValue="hero" className="w-full">
        <TabsList className="mb-6 bg-muted">
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="whyus">Why Us</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="hero">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="font-serif text-xl text-primary">
                Hero Section
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <Label className="text-foreground/80">Title</Label>
                <Input
                  value={heroData.title}
                  onChange={(e) =>
                    setHeroData({ ...heroData, title: e.target.value })
                  }
                  className="mt-1 border-border bg-input text-foreground"
                />
              </div>
              <div>
                <Label className="text-foreground/80">Address Line 1</Label>
                <Input
                  value={heroData.address1}
                  onChange={(e) =>
                    setHeroData({ ...heroData, address1: e.target.value })
                  }
                  className="mt-1 border-border bg-input text-foreground"
                />
              </div>
              <div>
                <Label className="text-foreground/80">Address Line 2</Label>
                <Input
                  value={heroData.address2}
                  onChange={(e) =>
                    setHeroData({ ...heroData, address2: e.target.value })
                  }
                  className="mt-1 border-border bg-input text-foreground"
                />
              </div>
              <div>
                <Label className="text-foreground/80">Phone</Label>
                <Input
                  value={heroData.phone}
                  onChange={(e) =>
                    setHeroData({ ...heroData, phone: e.target.value })
                  }
                  className="mt-1 border-border bg-input text-foreground"
                />
              </div>
              <Button
                onClick={() => handleSave("Hero")}
                className="w-fit bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whyus">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="font-serif text-xl text-primary">
                Why Us Section
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <Label className="text-foreground/80">
                  Introduction Paragraph
                </Label>
                <Textarea
                  value={whyUsData.intro}
                  onChange={(e) =>
                    setWhyUsData({ ...whyUsData, intro: e.target.value })
                  }
                  rows={5}
                  className="mt-1 border-border bg-input text-foreground"
                />
              </div>
              <div>
                <Label className="text-foreground/80">Closing Line</Label>
                <Input
                  value={whyUsData.closing}
                  onChange={(e) =>
                    setWhyUsData({ ...whyUsData, closing: e.target.value })
                  }
                  className="mt-1 border-border bg-input text-foreground"
                />
              </div>
              <Button
                onClick={() => handleSave("Why Us")}
                className="w-fit bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="font-serif text-xl text-primary">
                About Section
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <Label className="text-foreground/80">
                  Studio Description
                </Label>
                <Textarea
                  value={aboutData.studioDescription}
                  onChange={(e) =>
                    setAboutData({
                      ...aboutData,
                      studioDescription: e.target.value,
                    })
                  }
                  rows={4}
                  className="mt-1 border-border bg-input text-foreground"
                />
              </div>
              <div>
                <Label className="text-foreground/80">Artist Name</Label>
                <Input
                  value={aboutData.artistName}
                  onChange={(e) =>
                    setAboutData({
                      ...aboutData,
                      artistName: e.target.value,
                    })
                  }
                  className="mt-1 border-border bg-input text-foreground"
                />
              </div>
              <div>
                <Label className="text-foreground/80">Artist Quote</Label>
                <Input
                  value={aboutData.artistQuote}
                  onChange={(e) =>
                    setAboutData({
                      ...aboutData,
                      artistQuote: e.target.value,
                    })
                  }
                  className="mt-1 border-border bg-input text-foreground"
                />
              </div>
              <div>
                <Label className="text-foreground/80">Artist Bio</Label>
                <Textarea
                  value={aboutData.artistBio}
                  onChange={(e) =>
                    setAboutData({ ...aboutData, artistBio: e.target.value })
                  }
                  rows={6}
                  className="mt-1 border-border bg-input text-foreground"
                />
              </div>
              <Button
                onClick={() => handleSave("About")}
                className="w-fit bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="font-serif text-xl text-primary">
                Contact Section
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <Label className="text-foreground/80">Subtitle</Label>
                <Input
                  value={contactData.subtitle}
                  onChange={(e) =>
                    setContactData({
                      ...contactData,
                      subtitle: e.target.value,
                    })
                  }
                  className="mt-1 border-border bg-input text-foreground"
                />
              </div>
              <div>
                <Label className="text-foreground/80">Business Hours</Label>
                <Textarea
                  value={contactData.hours}
                  onChange={(e) =>
                    setContactData({ ...contactData, hours: e.target.value })
                  }
                  rows={3}
                  className="mt-1 border-border bg-input text-foreground"
                />
              </div>
              <div>
                <Label className="text-foreground/80">Facebook URL</Label>
                <Input
                  value={contactData.facebook}
                  onChange={(e) =>
                    setContactData({
                      ...contactData,
                      facebook: e.target.value,
                    })
                  }
                  className="mt-1 border-border bg-input text-foreground"
                />
              </div>
              <div>
                <Label className="text-foreground/80">Instagram URL</Label>
                <Input
                  value={contactData.instagram}
                  onChange={(e) =>
                    setContactData({
                      ...contactData,
                      instagram: e.target.value,
                    })
                  }
                  className="mt-1 border-border bg-input text-foreground"
                />
              </div>
              <Button
                onClick={() => handleSave("Contact")}
                className="w-fit bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
