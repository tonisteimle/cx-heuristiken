import {
  Title,
  Subtitle,
  SectionTitle,
  SubsectionTitle,
  BodyText,
  LeadText,
  MutedText,
  SmallText,
  LabelText,
  CardTitleText,
  CardDescriptionText,
  BoldText,
  ItalicText,
  CodeText,
  UnorderedList,
  OrderedList,
  ListItem,
  DialogTitleText,
  DialogDescriptionText,
  DialogParagraph,
} from "@/components/ui/typography"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Info } from "lucide-react"

export default function TypographyExample() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-4">
        <Title>Typografie-System</Title>
        <LeadText>
          Diese Seite demonstriert die verschiedenen Typografie-Komponenten, die im System verfügbar sind.
        </LeadText>
      </div>

      <div className="space-y-4">
        <Subtitle>Responsive Typografie</Subtitle>
        <div className="space-y-4 p-4 border rounded-md">
          <div className="space-y-2">
            <Title responsive={true}>Responsive Titel</Title>
            <MutedText>Ändert die Größe je nach Bildschirmbreite (text-2xl → text-3xl → text-4xl)</MutedText>
          </div>
          <div className="space-y-2">
            <Subtitle responsive={true}>Responsive Untertitel</Subtitle>
            <MutedText>Ändert die Größe je nach Bildschirmbreite (text-xl → text-2xl → text-3xl)</MutedText>
          </div>
          <div className="space-y-2">
            <SectionTitle responsive={true}>Responsive Abschnittstitel</SectionTitle>
            <MutedText>Ändert die Größe je nach Bildschirmbreite (text-lg → text-xl → text-2xl)</MutedText>
          </div>
          <div className="space-y-2">
            <BodyText responsive={true}>
              Dieser Text ist responsiv und passt sich der Bildschirmgröße an. Auf kleinen Bildschirmen ist er kleiner,
              auf größeren Bildschirmen wird er entsprechend größer.
            </BodyText>
            <MutedText>Ändert die Größe je nach Bildschirmbreite (text-sm → text-base → text-base)</MutedText>
          </div>
        </div>

        <div className="space-y-4 p-4 border rounded-md">
          <div className="space-y-2">
            <Title responsive={false}>Nicht-responsive Titel</Title>
            <MutedText>Behält immer die gleiche Größe (text-3xl)</MutedText>
          </div>
          <div className="space-y-2">
            <BodyText responsive={false}>
              Dieser Text ist nicht responsiv und behält immer die gleiche Größe, unabhängig von der Bildschirmgröße.
            </BodyText>
            <MutedText>Behält immer die gleiche Größe (text-base)</MutedText>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Subtitle>Überschriften</Subtitle>
        <div className="space-y-2">
          <Title>Titel (H1)</Title>
          <Subtitle>Untertitel (H2)</Subtitle>
          <SectionTitle>Abschnittstitel (H3)</SectionTitle>
          <SubsectionTitle>Unterabschnittstitel (H4)</SubsectionTitle>
        </div>
      </div>

      <div className="space-y-4">
        <Subtitle>Textabsätze</Subtitle>
        <div className="space-y-4">
          <BodyText>
            Dies ist ein Standard-Textabsatz. Er verwendet die Standardgröße und -farbe für den Hauptinhalt.
          </BodyText>
          <LeadText>
            Dies ist ein hervorgehobener Textabsatz. Er wird für Einleitungen oder wichtige Informationen verwendet.
          </LeadText>
          <MutedText>
            Dies ist ein gedämpfter Textabsatz. Er wird für weniger wichtige Informationen verwendet.
          </MutedText>
          <SmallText>Dies ist ein kleiner Textabsatz. Er wird für Anmerkungen oder Fußnoten verwendet.</SmallText>
          <DialogParagraph>
            Dies ist ein Dialog-Textabsatz. Er wird für Inhalte in Dialogen verwendet und unterstützt Zeilenumbrüche.
          </DialogParagraph>
        </div>
      </div>

      <div className="space-y-4">
        <Subtitle>Labels</Subtitle>
        <div className="space-y-2">
          <LabelText>Standard-Label</LabelText>
          <div>
            <LabelText icon={<Info size={14} />}>Label mit Icon</LabelText>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Subtitle>Karten-Typografie</Subtitle>
        <Card>
          <CardHeader>
            <CardTitleText>Kartentitel</CardTitleText>
            <CardDescriptionText>Dies ist eine Beschreibung für die Karte.</CardDescriptionText>
          </CardHeader>
          <CardContent>
            <BodyText>Dies ist der Inhalt der Karte.</BodyText>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Subtitle>Inline-Text</Subtitle>
        <div className="space-y-2">
          <BodyText>
            Dies ist ein Absatz mit <BoldText>fettgedrucktem</BoldText> und
            <ItalicText> kursivem </ItalicText>
            Text sowie <CodeText>Code-Formatierung</CodeText>.
          </BodyText>
        </div>
      </div>

      <div className="space-y-4">
        <Subtitle>Listen</Subtitle>
        <div className="space-y-4">
          <UnorderedList>
            <ListItem>Erster ungeordneter Listenpunkt</ListItem>
            <ListItem>Zweiter ungeordneter Listenpunkt</ListItem>
            <ListItem>Dritter ungeordneter Listenpunkt</ListItem>
          </UnorderedList>

          <OrderedList>
            <ListItem>Erster geordneter Listenpunkt</ListItem>
            <ListItem>Zweiter geordneter Listenpunkt</ListItem>
            <ListItem>Dritter geordneter Listenpunkt</ListItem>
          </OrderedList>
        </div>
      </div>

      <div className="space-y-4">
        <Subtitle>Dialog-Typografie</Subtitle>
        <div className="border p-4 rounded-md space-y-2">
          <DialogTitleText>Dialog-Titel</DialogTitleText>
          <DialogDescriptionText>Dies ist eine Beschreibung für den Dialog.</DialogDescriptionText>
          <div className="mt-4">
            <DialogParagraph>
              Dies ist ein Absatz im Dialog-Inhalt. Er unterstützt Zeilenumbrüche und hat eine spezielle Formatierung.
            </DialogParagraph>
          </div>
        </div>
      </div>
    </div>
  )
}
