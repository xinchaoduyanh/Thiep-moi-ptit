import type { Metadata } from "next";
import { Be_Vietnam_Pro, Cormorant_Garamond, Dancing_Script } from "next/font/google";
import giftImage from "../../../assets/gift.png";
import schoolImage from "../../../assets/school.png";
import { demoInvite, salutationLabel, splitWishLines } from "@/lib/invitations";
import { submitInvitationMessage } from "./actions";
import { InvitationExperience } from "./InvitationExperience";

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
});

const handwriting = Dancing_Script({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-handwriting",
});

const serif = Cormorant_Garamond({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
});

const googleMapsUrl =
  "https://www.google.com/maps/place/H%E1%BB%8Dc+vi%E1%BB%87n+C%C3%B4ng+ngh%E1%BB%87+B%C6%B0u+ch%C3%ADnh+vi%E1%BB%85n+th%C3%B4ng/@20.9810412,105.7857614,17z/data=!4m23!1m16!4m15!1m6!1m2!1s0x313513005bbf6bc5:0xa8d80c6a7a54850!2zVuG7iyB0csOtIGPhu6dhIGLhuqFuIHRow7RuIG7DoCB44buPbSwgUGjDuSBMaeG7hW4sIE5hbSBTw6FjaCwgSOG6o2kgUGjDsm5nLCBWaeG7h3QgTmFt!2m2!1d106.3189856!2d20.9759745!1m6!1m2!1s0x3134532b120f4e29:0x67cb6a0ef9dddb40!2zUC4gTmd1eeG7hW4gVHLDo2ksIEjDoCDEkMO0bmcsIEjDoCBO4buZaSwgVmnhu4d0IE5hbQ!2m2!1d105.779898!2d20.9718187!3e0!3m5!1s0x3135accdd8a1ad71:0xa2f9b16036648187!8m2!3d20.980913!4d105.7874165!16s%2Fg%2F12168p16?hl=vi&entry=ttu&g_ep=EgoyMDI2MDUwNi4wIKXMDSoASAFQAw%3D%3D";
const googleMapsEmbedUrl = "https://www.google.com/maps?q=20.980913,105.7874165&z=17&output=embed";

export const metadata: Metadata = {
  title: "Thiệp mời tốt nghiệp PTIT",
  description: "Thiệp mời dự lễ tốt nghiệp tại Học viện Công nghệ Bưu chính Viễn thông.",
};

type SearchValue = string | string[] | undefined;

type InvitationPageProps = {
  searchParams: Promise<{
    name?: SearchValue;
    guest?: SearchValue;
    wish?: SearchValue;
    fb?: SearchValue;
  }>;
};

function firstValue(value: SearchValue) {
  return Array.isArray(value) ? value[0] : value;
}

function wishLines(value: SearchValue) {
  const raw = firstValue(value);
  return splitWishLines(raw || demoInvite.privateWish);
}

export default async function InvitationPage({ searchParams }: InvitationPageProps) {
  const query = await searchParams;
  const guestName = firstValue(query.name) || firstValue(query.guest) || demoInvite.guestName;
  const facebookUrl = firstValue(query.fb) || "https://www.facebook.com/danhvuvu192";

  return (
    <InvitationExperience
      className={`${beVietnam.variable} ${handwriting.variable} ${serif.variable}`}
      facebookUrl={facebookUrl}
      giftImage={giftImage}
      googleMapsEmbedUrl={googleMapsEmbedUrl}
      googleMapsUrl={googleMapsUrl}
      guestName={guestName}
      inviteId={demoInvite.id}
      inviteSlug={demoInvite.slug}
      messageAction={submitInvitationMessage}
      salutation={salutationLabel(demoInvite.salutation)}
      schoolImage={schoolImage}
      wishLines={wishLines(query.wish)}
    />
  );
}
