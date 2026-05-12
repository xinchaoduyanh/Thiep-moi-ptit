import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Be_Vietnam_Pro, Cormorant_Garamond, Dancing_Script } from "next/font/google";
import giftImage from "../../../../assets/gift.png";
import schoolImage from "../../../../assets/school.png";
import { getInviteWithMessagesBySlug, salutationLabel, splitWishLines } from "@/lib/invitations";
import { submitInvitationMessage } from "../actions";
import { InvitationExperience } from "../InvitationExperience";

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

const previewImage = "/og-invitation.jpg";
const googleMapsUrl =
  "https://www.google.com/maps/place/H%E1%BB%8Dc+vi%E1%BB%87n+C%C3%B4ng+ngh%E1%BB%87+B%C6%B0u+ch%C3%ADnh+vi%E1%BB%85n+th%C3%B4ng/@20.9810412,105.7857614,17z/data=!4m23!1m16!4m15!1m6!1m2!1s0x313513005bbf6bc5:0xa8d80c6a7a54850!2zVuG7iyB0csOtIGPhu6dhIGLhuqFuIHRow7RuIG7DoCB44buPbSwgUGjDuSBMaeG7hW4sIE5hbSBTw6FjaCwgSOG6o2kgUGjDsm5nLCBWaeG7h3QgTmFt!2m2!1d106.3189856!2d20.9759745!1m6!1m2!1s0x3134532b120f4e29:0x67cb6a0ef9dddb40!2zUC4gTmd1eeG7hW4gVHLDo2ksIEjDoCDEkMO0bmcsIEjDoCBO4buZaSwgVmnhu4d0IE5hbQ!2m2!1d105.779898!2d20.9718187!3e0!3m5!1s0x3135accdd8a1ad71:0xa2f9b16036648187!8m2!3d20.980913!4d105.7874165!16s%2Fg%2F12168p16?hl=vi&entry=ttu&g_ep=EgoyMDI2MDUwNi4wIKXMDSoASAFQAw%3D%3D";
const googleMapsEmbedUrl = "https://www.google.com/maps?q=20.980913,105.7874165&z=17&output=embed";

type InvitationSlugPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: InvitationSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const invite = await getInviteWithMessagesBySlug(slug);
  const title = invite ? `Thiệp mời ${invite.guestName}` : "Thiệp mời PTIT";
  const description = "Mở thiệp để xem lời nhắn riêng và thông tin lễ tốt nghiệp tại PTIT.";

  return {
    title,
    description,
    alternates: {
      canonical: `/invitation/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/invitation/${slug}`,
      images: [
        {
          url: previewImage,
          width: 1200,
          height: 630,
          alt: "Thiệp mời tốt nghiệp PTIT",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [previewImage],
    },
  };
}

export default async function InvitationSlugPage({ params }: InvitationSlugPageProps) {
  const { slug } = await params;
  const invite = await getInviteWithMessagesBySlug(slug);

  if (!invite) {
    notFound();
  }

  return (
    <InvitationExperience
      className={`${beVietnam.variable} ${handwriting.variable} ${serif.variable}`}
      facebookUrl={invite.facebookUrl}
      giftImage={giftImage}
      googleMapsEmbedUrl={googleMapsEmbedUrl}
      googleMapsUrl={googleMapsUrl}
      guestName={invite.guestName}
      inviteId={invite.id}
      inviteSlug={invite.slug}
      messageAction={submitInvitationMessage}
      salutation={salutationLabel(invite.salutation)}
      schoolImage={schoolImage}
      wishLines={splitWishLines(invite.privateWish)}
    />
  );
}
