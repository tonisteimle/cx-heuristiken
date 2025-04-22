import type { Principle } from "@/types/guideline"

// Vordefinierte psychologische Prinzipien
export const predefinedPrinciples: Principle[] = [
  {
    id: "availability-heuristic",
    name: "Availability Heuristic",
    description:
      "Du schätzt die Bedeutung eines Produkts danach ein, wie schnell Dir passende Beispiele in den Sinn kommen. Diese mentale Abkürzung bewirkt, dass wiederkehrende, bekannte Eindrücke die Kaufentscheidung stark beeinflussen. Produkte mit vertrauten Namen oder bekannten Marken werden dadurch oft bevorzugt. Im Onlinehandel kannst Du diesen Effekt nutzen, indem Du prominente Kundenbewertungen, wiederkehrende Testimonials und medienwirksame Kampagnen einsetzt.",
  },
  {
    id: "overconfidence",
    name: "Overconfidence",
    description:
      "Du überschätzt häufig Deine eigenen Fähigkeiten und Einschätzungen, wodurch Risiken oft unterschätzt werden. Dieses übermäßige Selbstvertrauen führt dazu, dass kritische Informationen oder alternative Sichtweisen vernachlässigt werden. Anbieter sollten daher objektives Nutzerfeedback und A/B-Tests einsetzen, um realistische Bewertungen sicherzustellen.",
  },
  {
    id: "bystander-effect",
    name: "Bystander Effect",
    description:
      "In Gruppensituationen verlierst Du leicht die Eigeninitiative, da Du davon ausgehst, dass andere aktiv werden. Diese Tendenz kann dazu führen, dass wichtige Fragen oder Unterstützungsanfragen in großen Online-Communitys ungestellt bleiben. Durch persönliche Interaktionsangebote, wie Live-Chats oder individuelle Kontaktoptionen, lässt sich dieser Effekt überwinden.",
  },
  {
    id: "curiosity",
    name: "Curiosity",
    description:
      'Neugier treibt Dich an, mehr über ein Produkt zu erfahren, wodurch Du länger verweilst und tiefer in Inhalte eintauchst. Ein gut strukturierter Informationsfluss, der interessante Details schrittweise präsentiert, kann diese Neugier gezielt wecken. Interaktive Elemente wie Quizze, Produkt-Demos oder „Entdecke mehr"-Buttons fördern den Wunsch, weiter in das Angebot einzutauchen.',
  },
  {
    id: "facial-distraction",
    name: "Facial Distraction",
    description:
      "Gesichter in Bildern ziehen Deine Aufmerksamkeit automatisch auf sich und lösen emotionale Reaktionen aus. Der Einsatz von Portraits kann den Blick des Nutzers stark auf die abgebildete Person lenken, sodass begleitende Informationen untergehen. Um dies gezielt zu nutzen, sollten Bilder so eingesetzt werden, dass sie sowohl Emotion als auch wichtige Produktinformationen transportieren.",
  },
  {
    id: "gaze-cueing-effect",
    name: "Gaze Cueing Effect",
    description:
      "Die Blickrichtung von abgebildeten Personen beeinflusst unbewusst, wohin Deine Aufmerksamkeit gelenkt wird. Wenn beispielsweise ein Modell in einem Bild mit dem Finger auf ein bestimmtes Element zeigt, folgt Dein Blick automatisch diesem Hinweis. Solche visuellen Trigger können dazu beitragen, dass Nutzer gezielt wichtige Produktfeatures oder Angebote bemerken.",
  },
  {
    id: "inattentional-blindness-effect",
    name: "Inattentional Blindness Effect",
    description:
      "Trotz sichtbarer Informationen übersießt Du manchmal wichtige Details, wenn Deine Aufmerksamkeit zu stark fokussiert ist. Eine Überfrachtung mit Inhalten kann dazu führen, dass kritische Kaufanreize im Hintergrund verschwinden. Ein klar strukturiertes, minimalistisches Layout hilft dabei, dass alle relevanten Informationen optimal wahrgenommen werden.",
  },
  {
    id: "barnum-effect",
    name: "Barnum Effect",
    description:
      "Du interpretierst allgemein gehaltene, vage Aussagen oft als persönlich und spezifisch für Dich. Diese universellen Botschaften wirken so individuell, dass sie das Gefühl vermitteln, genau auf Deine Bedürfnisse einzugehen. Im Onlinehandel können allgemeine, positiv formulierte Aussagen dazu beitragen, dass sich Kunden angesprochen fühlen.",
  },
  {
    id: "empathy-gap",
    name: "Empathy Gap",
    description:
      "Es fällt Dir manchmal schwer, die emotionalen Zustände und Bedürfnisse anderer vollständig nachzuvollziehen. Diese emotionale Distanz kann dazu führen, dass Du die tatsächlichen Vorteile eines Produkts oder Services unterschätzt. Um dem entgegenzuwirken, sollten Online-Shops auf empathische Kommunikation setzen, etwa durch persönlich gestaltete Chatbots oder videobasierte Testimonials.",
  },
  {
    id: "focusing-effect",
    name: "Focusing Effect",
    description:
      "Du konzentrierst Dich häufig übermäßig auf einen einzelnen Aspekt eines Produkts und übersießt dabei andere wichtige Informationen. Diese selektive Wahrnehmung kann dazu führen, dass das Gesamtbild verzerrt wird. Eine ausgewogene Darstellung aller Produktvorteile über interaktive Vergleichstabellen und Filterfunktionen sorgt für mehr Transparenz.",
  },
  {
    id: "funktionale-fixierung",
    name: "Funktionale Fixierung",
    description:
      "Du beschränkst Dich oft auf die herkömmliche Nutzung eines Produkts und übersiehst alternative Anwendungsmöglichkeiten. Diese Fixierung hemmt die Kreativität und verhindert, dass der volle Mehrwert eines Produkts erkannt wird. Durch den Einsatz von Produktvideos, Tutorials und kreativen Blogbeiträgen können alternative Einsatzszenarien aufgezeigt werden.",
  },
  {
    id: "identifiable-victim-effect",
    name: "Identifiable Victim Effect",
    description:
      "Du reagierst emotional intensiver auf konkrete, identifizierbare Schicksale als auf abstrakte Statistiken. Einzelne Fallbeispiele oder persönliche Geschichten können Deine Wahrnehmung von Risiken und Nutzen stark beeinflussen. Authentische Kundenberichte und detaillierte Fallstudien, die konkrete Problemlösungen aufzeigen, können das Vertrauen in ein Produkt deutlich steigern.",
  },
  {
    id: "status-quo-bias",
    name: "Status quo Bias",
    description:
      "Du bevorzugst den bestehenden Zustand, weil das Vertraute als sicher und zuverlässig empfunden wird. Dies kann dazu führen, dass selbst vorteilhafte Neuerungen abgelehnt werden, wenn sie zu sehr vom Gewohnten abweichen. Ein sanfter Übergang zu neuen Features, unterstützt durch Treueprogramme und schrittweise Updates, hilft, die Akzeptanz zu erhöhen.",
  },
  {
    id: "threat",
    name: "Threat",
    description:
      "Du reagierst instinktiv auf potenzielle Gefahren, was dazu führen kann, dass Angebote aufgrund von wahrgenommenen Risiken abgelehnt werden. Ein erhöhter Bedrohungseindruck verzerrt die Risikowahrnehmung und kann selbst bei objektiv geringen Gefahren den Kaufentscheid negativ beeinflussen. Um diesem Effekt entgegenzuwirken, sollten Sicherheitszertifikate, transparente Rückgabe- und Garantiebestimmungen sowie vertrauensbildende Kundenbewertungen prominent platziert werden.",
  },
  {
    id: "context-dependent-memory",
    name: "Context Dependent Memory",
    description:
      "Deine Fähigkeit, Informationen abzurufen, ist stark vom Kontext abhängig, in dem sie ursprünglich aufgenommen wurden. Vertraute Umgebungen und konsistente Designelemente fördern die Erinnerung und sorgen dafür, dass positive Einkaufserlebnisse besser verankert werden. Ein einheitliches, markenkonformes Design und personalisierte Dashboards helfen, wichtige Informationen dauerhaft präsent zu halten.",
  },
  {
    id: "primacy-effect",
    name: "Primacy Effect",
    description:
      "Die ersten Informationen, die Du erhältst, haben einen überproportional starken Einfluss auf Deine Gesamtwahrnehmung eines Produkts. Ein positiver erster Eindruck prägt Deine weitere Bewertung maßgeblich und beeinflusst den gesamten Entscheidungsprozess. Deshalb sollte die Startseite klar und überzeugend gestaltet sein – etwa durch eindrucksvolle Hero-Banner und prägnante Produktbeschreibungen.",
  },
  {
    id: "recency-effect",
    name: "Recency Effect",
    description:
      "Die zuletzt präsentierten Informationen bleiben besonders gut in Deinem Gedächtnis haften und beeinflussen Deine Kaufentscheidung maßgeblich. Der Abschluss des Kaufprozesses, etwa durch Zusammenfassungen oder abschließende Calls-to-Action, prägt den finalen Eindruck. Durch strategische Gestaltung des Checkout-Bereichs, wie etwa Dankeschön-Seiten und Follow-up-E-Mails, können die letzten Eindrücke positiv verstärkt werden.",
  },
  {
    id: "rhyme-as-reason-effect",
    name: "Rhyme-as-Reason Effect",
    description:
      "Reime und rhythmische Formulierungen erleichtern die Verarbeitung von Informationen und verleihen Aussagen eine scheinbare Logik. Solche sprachlichen Muster machen Botschaften einprägsam und unterstützen den emotionalen Zugang zum Angebot. Durch den gezielten Einsatz von reimenden Slogans oder rhythmischen Claims in Werbeanzeigen können die Kernbotschaften verstärkt werden.",
  },
  {
    id: "serial-position-effect",
    name: "Serial Position Effect",
    description:
      "Du erinnerst Dich besonders gut an Elemente, die am Anfang oder am Ende einer Liste stehen, während mittlere Informationen oft in den Hintergrund geraten. Eine strategische Reihenfolge der Informationspräsentation ist daher entscheidend, um alle wichtigen Details im Gedächtnis zu verankern. Im Onlinehandel können Bestsellerlisten, Filterfunktionen und gezielt platzierte Navigationselemente dafür sorgen, dass die relevantesten Angebote optimal wahrgenommen werden.",
  },
  {
    id: "story-bias",
    name: "Story Bias",
    description:
      "Geschichten haben eine höhere emotionale Wirkung als reine Fakten und bleiben länger im Gedächtnis haften. Narrative Elemente verpacken komplexe Informationen in eine leicht verständliche Form, die den Nutzer fesselt. Kunden-Storys, Fallstudien oder interaktive Storytelling-Elemente im Online-Shop können den praktischen Nutzen eines Produkts lebendig veranschaulichen.",
  },
  {
    id: "von-restorff-effect",
    name: "Von Restorff Effect",
    description:
      "Auffällige, einzigartige Elemente heben sich vom Rest des Angebots ab und bleiben besonders gut im Gedächtnis. Ein einzelnes markantes Designelement wird oft als besonders wichtig wahrgenommen, auch wenn es nur einen Teil der Informationen repräsentiert. Im E‑Commerce kann dieser Effekt genutzt werden, indem Sonderangebote, exklusive Labels wie „Neu“ oder „Limited Edition“ und außergewöhnliche Grafiken gezielt hervorgehoben werden.",
  },
]
