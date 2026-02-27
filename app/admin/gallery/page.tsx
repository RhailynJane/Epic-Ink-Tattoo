"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Edit2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface GalleryImage {
  id: string;
  title: string;
  artist: string;
  category: string;
  url: string;
}

const initialImages: GalleryImage[] = [
  {
    id: "1",
    title: "Maple Leaf Portrait",
    artist: "Eman",
    category: "Color",
    url: "/images/gallery/tattoo-1.jpg",
  },
  {
    id: "2",
    title: "Tiger Cub",
    artist: "Eman",
    category: "Black & Grey",
    url: "/images/gallery/tattoo-2.jpg",
  },
  {
    id: "3",
    title: "Butterfly Art",
    artist: "Eman",
    category: "Black & Grey",
    url: "/images/gallery/tattoo-3.jpg",
  },
  {
    id: "4",
    title: "Dog Portrait",
    artist: "Eman",
    category: "Color",
    url: "/images/gallery/tattoo-4.jpg",
  },
  {
    id: "5",
    title: "Feather Design",
    artist: "Eman",
    category: "Fine Line",
    url: "/images/gallery/tattoo-5.jpg",
  },
  {
    id: "6",
    title: "Lion Realism",
    artist: "Eman",
    category: "Realism",
    url: "/images/gallery/tattoo-6.jpg",
  },
];

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>(initialImages);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);

  function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    toast.success("Image uploaded! Connect Convex to enable file storage.");
    setIsUploadOpen(false);
  }

  function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    toast.success("Image updated! Connect Convex to persist changes.");
    setEditingImage(null);
  }

  function handleDelete(id: string) {
    setImages((prev) => prev.filter((img) => img.id !== id));
    toast.success("Image deleted! Connect Convex to persist changes.");
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Gallery
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your tattoo portfolio images. {images.length} total images.
          </p>
        </div>

        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Upload Image
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border bg-card">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl text-primary">
                Upload Gallery Image
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="flex flex-col gap-4">
              <div>
                <Label className="text-foreground/80">Image File</Label>
                <div className="mt-1 flex items-center justify-center rounded-lg border-2 border-dashed border-border p-8 transition-colors hover:border-primary/30">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Drag and drop or click to upload
                    </p>
                    <Input
                      type="file"
                      accept="image/*"
                      className="mt-2 max-w-xs border-border bg-input text-foreground"
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-foreground/80">Title</Label>
                <Input
                  name="title"
                  placeholder="e.g. Rose Sleeve"
                  required
                  className="mt-1 border-border bg-input text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <Label className="text-foreground/80">Artist</Label>
                <Input
                  name="artist"
                  placeholder="e.g. Eman"
                  defaultValue="Eman"
                  required
                  className="mt-1 border-border bg-input text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <Label className="text-foreground/80">Category</Label>
                <Select defaultValue="Color">
                  <SelectTrigger className="mt-1 border-border bg-input text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-card">
                    <SelectItem value="Color">Color</SelectItem>
                    <SelectItem value="Black & Grey">
                      {"Black & Grey"}
                    </SelectItem>
                    <SelectItem value="Realism">Realism</SelectItem>
                    <SelectItem value="Traditional">Traditional</SelectItem>
                    <SelectItem value="Fine Line">Fine Line</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Upload
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image) => (
          <Card
            key={image.id}
            className="group border-border bg-card overflow-hidden transition-all hover:border-primary/30"
          >
            <div className="relative aspect-square overflow-hidden">
              <Image
                src={image.url}
                alt={image.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-serif font-semibold text-foreground">
                    {image.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    By {image.artist}
                  </p>
                  <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    {image.category}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => setEditingImage(image)}
                  >
                    <Edit2 className="h-4 w-4" />
                    <span className="sr-only">Edit {image.title}</span>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete {image.title}</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="border-border bg-card">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-foreground">
                          Delete Image
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                          Are you sure you want to delete {'"'}
                          {image.title}
                          {'"'}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-border bg-transparent text-foreground hover:bg-muted">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(image.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingImage} onOpenChange={() => setEditingImage(null)}>
        <DialogContent className="border-border bg-card">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-primary">
              Edit Image
            </DialogTitle>
          </DialogHeader>
          {editingImage && (
            <form onSubmit={handleEdit} className="flex flex-col gap-4">
              <div>
                <Label className="text-foreground/80">Title</Label>
                <Input
                  name="title"
                  defaultValue={editingImage.title}
                  className="mt-1 border-border bg-input text-foreground"
                />
              </div>
              <div>
                <Label className="text-foreground/80">Artist</Label>
                <Input
                  name="artist"
                  defaultValue={editingImage.artist}
                  className="mt-1 border-border bg-input text-foreground"
                />
              </div>
              <div>
                <Label className="text-foreground/80">Category</Label>
                <Select defaultValue={editingImage.category}>
                  <SelectTrigger className="mt-1 border-border bg-input text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-card">
                    <SelectItem value="Color">Color</SelectItem>
                    <SelectItem value="Black & Grey">
                      {"Black & Grey"}
                    </SelectItem>
                    <SelectItem value="Realism">Realism</SelectItem>
                    <SelectItem value="Traditional">Traditional</SelectItem>
                    <SelectItem value="Fine Line">Fine Line</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Save Changes
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
