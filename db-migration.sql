-- Hinzufügen der neuen SVG-Spalten zur guidelines-Tabelle
ALTER TABLE guidelines
ADD COLUMN svg_content TEXT,
ADD COLUMN detail_svg_content TEXT;

-- Hinweis: Die alten Bildspalten werden beibehalten, um Abwärtskompatibilität zu gewährleisten
-- In einer späteren Migration können sie entfernt werden, wenn sie nicht mehr benötigt werden
