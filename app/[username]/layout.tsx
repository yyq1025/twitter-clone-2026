export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="max-w-xl flex-1 border-gray-100 border-x">{children}</main>
  );
}
