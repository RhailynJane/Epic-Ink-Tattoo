type StructuredDataProps = {
  siteUrl: string;
};

export function StructuredData({ siteUrl }: StructuredDataProps) {
  const businessLd = {
    "@context": "https://schema.org",
    "@type": "TattooParlor",
    "@id": `${siteUrl}/#business`,
    name: "Epic Ink Tattoo",
    alternateName: "Epic Ink Tattoo Studio",
    description:
      "Calgary's premier custom tattoo studio at New Horizon Mall in Balzac, AB. Specializing in realism, fine line, black & grey, colour, cover-ups and custom designs.",
    url: siteUrl,
    image: `${siteUrl}/images/og-image.jpg`,
    logo: `${siteUrl}/icon.svg`,
    telephone: "",
    priceRange: "$$",
    currenciesAccepted: "CAD",
    paymentAccepted: "Cash, Credit Card, Debit Card",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Unit A23, New Horizon Mall, 260300 Writing Creek Crescent",
      addressLocality: "Balzac",
      addressRegion: "AB",
      postalCode: "T4A 0X8",
      addressCountry: "CA",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 51.2217,
      longitude: -114.0128,
    },
    areaServed: [
      { "@type": "City", name: "Calgary" },
      { "@type": "City", name: "Airdrie" },
      { "@type": "City", name: "Balzac" },
      { "@type": "City", name: "Cochrane" },
      { "@type": "City", name: "Chestermere" },
      { "@type": "AdministrativeArea", name: "Alberta" },
    ],
    sameAs: [
      "https://www.facebook.com/",
      "https://www.instagram.com/",
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "11:00",
        closes: "19:00",
      },
    ],
    makesOffer: [
      "Custom Tattoo Design",
      "Realism Tattoo",
      "Fine Line Tattoo",
      "Black and Grey Tattoo",
      "Colour Tattoo",
      "Cover Up Tattoo",
      "Japanese Tattoo",
      "Neo Traditional Tattoo",
      "Portrait Tattoo",
      "Script Tattoo",
      "Sleeve Tattoo",
    ].map((s) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: s, areaServed: "Calgary, AB" },
    })),
  };

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: "Epic Ink Tattoo",
    publisher: { "@id": `${siteUrl}/#business` },
    inLanguage: "en-CA",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
      />
    </>
  );
}
