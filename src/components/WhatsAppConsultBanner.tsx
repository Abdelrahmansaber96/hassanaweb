import Link from "next/link";
import { siteConfig } from "@/lib/site";

function WhatsAppIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function ProductMiniatures() {
  return (
    <div className="pointer-events-none absolute -bottom-4 left-4 hidden items-end gap-3 lg:flex" aria-hidden="true">
      <div className="flex items-end gap-3 rounded-[28px] border border-white/35 bg-white/82 px-5 py-4 shadow-[0_20px_45px_rgba(7,42,36,0.16)] backdrop-blur-md">
        <div className="w-14">
          <div className="mx-auto h-5 w-9 rounded-t-xl bg-[#E8EFF4]" />
          <div className="rounded-[20px] bg-gradient-to-b from-[#FFFFFF] to-[#D7F0E2] p-2 shadow-inner">
            <div className="h-16 rounded-2xl bg-[#2D8A56]/15" />
          </div>
        </div>
        <div className="w-16">
          <div className="mx-auto h-4 w-8 rounded-t-lg bg-[#F0F3F8]" />
          <div className="rounded-[22px] bg-gradient-to-b from-[#FDFEFE] to-[#EEF8F2] p-2 shadow-inner">
            <div className="h-20 rounded-[18px] bg-[#74C559]/18" />
          </div>
        </div>
        <div className="w-20 overflow-hidden rounded-[22px] border border-[#D6EBDD] bg-[#FFFFFF] shadow-sm">
          <div className="h-8 bg-gradient-to-r from-[#0E6D62] to-[#2D8A56]" />
          <div className="p-3">
            <div className="h-3 w-12 rounded-full bg-[#DCE8F4]" />
            <div className="mt-2 h-10 rounded-2xl bg-[#EFF8F1]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WhatsAppConsultBanner() {
  return (
    <section className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[40px] bg-[linear-gradient(135deg,#0E6D62_0%,#11756B_34%,#2D8A56_100%)] px-6 py-8 text-white shadow-[0_26px_80px_rgba(9,61,52,0.22)] sm:px-8 lg:px-12 lg:py-10">
          <div className="absolute -top-16 -left-10 h-52 w-52 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
          <div className="absolute top-8 right-[32%] h-24 w-24 rounded-full border border-white/14 bg-white/8" aria-hidden="true" />
          <div className="absolute bottom-8 left-[40%] h-36 w-36 rounded-full border border-white/10 bg-white/5" aria-hidden="true" />
          <div className="absolute inset-y-0 right-0 w-[42%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.11),transparent_60%)]" aria-hidden="true" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="text-right">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold backdrop-blur-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-[#D9FF71]" />
                خدمة واتساب مباشرة
              </div>

              <h2 className="mt-5 text-2xl font-extrabold leading-[1.5] sm:text-3xl lg:text-[2.45rem]">
                تواصل مع خدمة عملاء الصيدلية البيطرية
                <br />
                لمساعدتك في رعاية حيواناتك
              </h2>

              <p className="mt-5 text-xl font-bold text-[#E7FF9A] sm:text-2xl">
                هل تحتاج إلى استشارة؟
              </p>

              <p className="mt-5 max-w-2xl text-sm leading-8 text-white/88 sm:text-base">
                استشارة بيطرية من أطباء متخصصين لمساعدتك في رعاية حيواناتك بكفاءة.
              </p>

              <div className="mt-7 flex flex-wrap items-center justify-start gap-4">
                <Link
                  href={siteConfig.contact.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 rounded-2xl bg-[#25D366] px-6 py-4 text-base font-extrabold text-white shadow-[0_16px_35px_rgba(37,211,102,0.28)] transition-transform hover:scale-[1.02]"
                >
                  <WhatsAppIcon className="w-6 h-6" />
                  راسلنا الآن عبر واتساب
                </Link>

                <div className="rounded-2xl border border-white/18 bg-white/10 px-4 py-3 text-right backdrop-blur-sm">
                  <p className="text-sm font-semibold text-white/92">
                    تواصل مع خدمة عملاء الصيدلية البيطرية
                  </p>
                </div>
              </div>
            </div>

            <div className="relative flex items-center justify-center lg:justify-end">
              <ProductMiniatures />

              <div className="relative h-[360px] w-[210px] rounded-[42px] border border-white/25 bg-[#0A2437]/50 p-3 shadow-[0_32px_60px_rgba(2,18,24,0.32)] backdrop-blur-xl sm:h-[420px] sm:w-[240px]">
                <div className="absolute left-1/2 top-3 h-1.5 w-20 -translate-x-1/2 rounded-full bg-white/35" />
                <div className="relative flex h-full flex-col overflow-hidden rounded-[32px] bg-[linear-gradient(180deg,#E8FFF3_0%,#F6FFF8_100%)]">
                  <div className="flex items-center justify-between px-5 pt-5 text-[#0E6D62]">
                    <span className="text-xs font-bold">WhatsApp</span>
                    <span className="text-[11px] font-semibold">11:11</span>
                  </div>

                  <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_14px_30px_rgba(37,211,102,0.28)]">
                      <WhatsAppIcon className="h-12 w-12" />
                    </div>

                    <p className="mt-6 text-base font-extrabold text-[#10443D]">
                      خدمة عملاء الصيدلية البيطرية
                    </p>

                    <div className="mt-5 w-full space-y-3">
                      <div className="mr-auto max-w-[85%] rounded-[18px] rounded-br-sm bg-white px-4 py-3 text-right text-sm font-semibold leading-6 text-[#1D3C53] shadow-sm">
                        هل تحتاج إلى استشارة؟
                      </div>
                      <div className="max-w-[88%] rounded-[18px] rounded-bl-sm bg-[#DCF8C7] px-4 py-3 text-right text-sm font-semibold leading-6 text-[#184A24] shadow-sm">
                        راسلنا الآن عبر واتساب
                      </div>
                    </div>
                  </div>

                  <div className="px-4 pb-4">
                    <div className="flex items-center gap-3 rounded-full bg-white px-4 py-3 shadow-sm">
                      <div className="h-10 w-10 rounded-full bg-[#25D366] text-white flex items-center justify-center">
                        <WhatsAppIcon className="w-5 h-5" />
                      </div>
                      <div className="h-3 flex-1 rounded-full bg-[#E2F2E8]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -right-2 top-8 hidden rounded-3xl border border-white/28 bg-white/14 px-5 py-4 text-right backdrop-blur-md lg:block">
                <p className="text-xs font-bold text-white/75">استجابة سريعة</p>
                <p className="mt-1 text-lg font-extrabold">خدمة واتساب</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}