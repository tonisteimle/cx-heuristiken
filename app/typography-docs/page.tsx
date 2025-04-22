import {
  Title,
  Subtitle,
  SectionTitle,
  SubsectionTitle,
  BodyText,
  LeadText,
  MutedText,
  SmallText,
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
import { LabelText } from "@/components/ui/typography"

export default function TypographyDocsPage() {
  return (
    <div className="container mx-auto p-6 space-y-8 max-w-4xl">
      <div className="space-y-4">
        <Title>Typografie-Dokumentation</Title>
        <LeadText>
          Eine umfassende Dokumentation des semantischen Typografiesystems für die Guidelines-Anwendung.
        </LeadText>
      </div>

      <div className="space-y-4">
        <Subtitle>Einführung</Subtitle>
        <BodyText>
          Das semantische Typografiesystem bietet eine konsistente und wartbare Typografie für die gesamte Anwendung. Es
          verwendet React-Komponenten, die semantische Bedeutung tragen und responsive Anpassungen unterstützen.
        </BodyText>
      </div>

      <div className="space-y-4">
        <SectionTitle>Vorteile des semantischen Typografiesystems</SectionTitle>
        <UnorderedList>
          <ListItem>
            <BoldText>Konsistenz:</BoldText> Einheitliche Typografie in der gesamten Anwendung
          </ListItem>
          <ListItem>
            <BoldText>Wartbarkeit:</BoldText> Zentrale Änderungen an der Typografie ohne Anpassung jeder einzelnen
            Komponente
          </ListItem>
          <ListItem>
            <BoldText>Semantik:</BoldText> Klare Bedeutung der Typografieelemente durch ihre Namen
          </ListItem>
          <ListItem>
            <BoldText>Responsivität:</BoldText> Automatische Anpassung der Schriftgrößen an verschiedene
            Bildschirmgrößen
          </ListItem>
          <ListItem>
            <BoldText>Barrierefreiheit:</BoldText> Verbesserte Lesbarkeit und Hierarchie der Inhalte
          </ListItem>
        </UnorderedList>
      </div>

      <div className="space-y-4">
        <SectionTitle>Verwendung</SectionTitle>
        <SubsectionTitle>Grundlegende Verwendung</SubsectionTitle>
        <BodyText>Die Typografiekomponenten können direkt importiert und verwendet werden:</BodyText>
        <div className="bg-gray-100 p-4 rounded-md my-4">
          <CodeText>
            {`import { Title, BodyText } from "@/components/ui/typography"

export default function MyComponent() {
  return (
    <div>
      <Title>Mein Titel</Title>
      <BodyText>Mein Text</BodyText>
    </div>
  )
}`}
          </CodeText>
        </div>

        <SubsectionTitle>Responsive Typografie</SubsectionTitle>
        <BodyText>
          Alle Typografiekomponenten unterstützen responsive Anpassungen. Standardmäßig sind sie responsiv, dies kann
          aber mit dem <CodeText>responsive</CodeText>-Prop deaktiviert werden:
        </BodyText>
        <div className="bg-gray-100 p-4 rounded-md my-4">
          <CodeText>
            {`<Title responsive={true}>Responsiver Titel</Title>
<BodyText responsive={false}>Nicht-responsiver Text</BodyText>`}
          </CodeText>
        </div>
      </div>

      <div className="space-y-4">
        <SectionTitle>Verfügbare Komponenten</SectionTitle>

        <Card className="mb-4">
          <CardHeader>
            <CardTitleText>Überschriften</CardTitleText>
            <CardDescriptionText>Komponenten für Überschriften verschiedener Ebenen</CardDescriptionText>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Title>Title</Title>
                <MutedText>Für Hauptüberschriften (H1)</MutedText>
                <SmallText className="mt-1">Responsive: text-2xl → text-3xl → text-4xl</SmallText>
              </div>
              <div>
                <Subtitle>Subtitle</Subtitle>
                <MutedText>Für Unterüberschriften (H2)</MutedText>
                <SmallText className="mt-1">Responsive: text-xl → text-2xl → text-3xl</SmallText>
              </div>
              <div>
                <SectionTitle>SectionTitle</SectionTitle>
                <MutedText>Für Abschnittsüberschriften (H3)</MutedText>
                <SmallText className="mt-1">Responsive: text-lg → text-xl → text-2xl</SmallText>
              </div>
              <div>
                <SubsectionTitle>SubsectionTitle</SubsectionTitle>
                <MutedText>Für Unterabschnittsüberschriften (H4)</MutedText>
                <SmallText className="mt-1">Responsive: text-base → text-lg → text-xl</SmallText>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitleText>Textabsätze</CardTitleText>
            <CardDescriptionText>Komponenten für verschiedene Textabsätze</CardDescriptionText>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <BodyText>BodyText: Standardtext für den Hauptinhalt</BodyText>
                <SmallText className="mt-1">Responsive: text-sm → text-base → text-base</SmallText>
              </div>
              <div>
                <LeadText>LeadText: Hervorgehobener Text für Einleitungen</LeadText>
                <SmallText className="mt-1">Responsive: text-base → text-lg → text-xl</SmallText>
              </div>
              <div>
                <MutedText>MutedText: Gedämpfter Text für weniger wichtige Informationen</MutedText>
                <SmallText className="mt-1">Responsive: text-xs → text-sm → text-sm</SmallText>
              </div>
              <div>
                <SmallText>SmallText: Kleiner Text für Anmerkungen oder Fußnoten</SmallText>
                <SmallText className="mt-1">Responsive: text-xs → text-xs → text-sm</SmallText>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitleText>Spezielle Komponenten</CardTitleText>
            <CardDescriptionText>Komponenten für spezielle Anwendungsfälle</CardDescriptionText>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <LabelText>LabelText: Text für Labels</LabelText>
                <SmallText className="mt-1">Responsive: text-xs → text-sm → text-sm</SmallText>
              </div>
              <div>
                <CardTitleText>CardTitleText: Titel für Karten</CardTitleText>
                <SmallText className="mt-1">Responsive: text-base → text-lg → text-lg</SmallText>
              </div>
              <div>
                <CardDescriptionText>CardDescriptionText: Beschreibung für Karten</CardDescriptionText>
                <SmallText className="mt-1">Responsive: text-xs → text-sm → text-sm</SmallText>
              </div>
              <div>
                <DialogTitleText>DialogTitleText: Titel für Dialoge</DialogTitleText>
                <SmallText className="mt-1">Responsive: text-base → text-lg → text-xl</SmallText>
              </div>
              <div>
                <DialogDescriptionText>DialogDescriptionText: Beschreibung für Dialoge</DialogDescriptionText>
                <SmallText className="mt-1">Responsive: text-xs → text-sm → text-sm</SmallText>
              </div>
              <div>
                <DialogParagraph>DialogParagraph: Text für Dialoge mit Zeilenumbrüchen</DialogParagraph>
                <SmallText className="mt-1">Responsive: text-sm → text-base → text-base</SmallText>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitleText>Inline-Text</CardTitleText>
            <CardDescriptionText>Komponenten für Inline-Textformatierung</CardDescriptionText>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <BodyText>
                  Text mit <BoldText>BoldText</BoldText> für Hervorhebungen
                </BodyText>
              </div>
              <div>
                <BodyText>
                  Text mit <ItalicText>ItalicText</ItalicText> für Betonungen
                </BodyText>
              </div>
              <div>
                <BodyText>
                  Text mit <CodeText>CodeText</CodeText> für Code-Snippets
                </BodyText>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitleText>Listen</CardTitleText>
            <CardDescriptionText>Komponenten für Listen</CardDescriptionText>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <SubsectionTitle>UnorderedList</SubsectionTitle>
                <UnorderedList>
                  <ListItem>Erster Listenpunkt</ListItem>
                  <ListItem>Zweiter Listenpunkt</ListItem>
                  <ListItem>Dritter Listenpunkt</ListItem>
                </UnorderedList>
              </div>
              <div>
                <SubsectionTitle>OrderedList</SubsectionTitle>
                <OrderedList>
                  <ListItem>Erster Listenpunkt</ListItem>
                  <ListItem>Zweiter Listenpunkt</ListItem>
                  <ListItem>Dritter Listenpunkt</ListItem>
                </OrderedList>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <SectionTitle>Best Practices</SectionTitle>
        <UnorderedList>
          <ListItem>
            Verwende semantische Komponenten entsprechend ihrer Bedeutung, nicht nur für das visuelle Erscheinungsbild
          </ListItem>
          <ListItem>Nutze die responsive Funktionalität für eine optimale Darstellung auf allen Geräten</ListItem>
          <ListItem>
            Vermeide direkte Tailwind-Klassen für Typografie, wenn semantische Komponenten verfügbar sind
          </ListItem>
          <ListItem>Kombiniere Typografiekomponenten mit anderen UI-Komponenten für konsistente Layouts</ListItem>
        </UnorderedList>
      </div>
    </div>
  )
}
