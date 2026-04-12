import StructuredData from "./StructuredData"

type BreadcrumbItem = {
  name: string
  item: string
}

type BreadcrumbJsonLdProps = {
  items: BreadcrumbItem[]
}

export default function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  }

  return <StructuredData data={data} />
}