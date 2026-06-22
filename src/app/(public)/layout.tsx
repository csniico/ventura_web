import { RedirectIfAuthed } from "@/features/auth/guard";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <RedirectIfAuthed>{children}</RedirectIfAuthed>;
}
