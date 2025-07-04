// app/page.tsx
// Bu basit sayfa, next-lite önizlemesinde dış istek hatası almamak için oluşturuldu.
// Gerçek üretim ortamında Supabase sorgularını ekleyebilirsiniz.

export const metadata = {
  title: "İş Yönetim Uygulaması",
  description: "Dashboard",
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-4xl font-bold">İş Yönetim Uygulaması</h1>
      <p className="text-muted-foreground text-center max-w-prose">
        Bu önizleme, harici API istekleri olmadan çalışacak şekilde sadeleştirilmiştir. Üretim ortamında dashboard
        verileri Supabase üzerinden yüklenebilir.
      </p>
    </main>
  )
}
