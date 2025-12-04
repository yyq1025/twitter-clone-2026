export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex-1 max-w-xl border-x border-gray-100">{children}</main>
  );
}
