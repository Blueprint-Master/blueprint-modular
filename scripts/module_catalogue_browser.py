"""Browser acceptance tests for the sample interactions provided in the installed catalogue."""
import json
import os
from pathlib import Path
import re

from playwright.sync_api import expect, sync_playwright


def check_interactions(page, base):
    def visit(name, suffix='/simulateur'):
        page.goto(base + '/modules/' + name + suffix, wait_until='networkidle')

    def button(name):
        return page.get_by_role('button', name=name, exact=True)

    def choose(name):
        page.get_by_role('option', name=name, exact=True).click()

    def download(button):
        with page.expect_download() as result:
            button.click()
        return Path(result.value.path()).read_text(encoding='utf-8-sig')

    def reports():
        visit('rapports')
        button('Choisir un modèle').click()
        choose("Chiffre d'affaires mensuel")
        button('Générer').click()
        text = download(button('Télécharger CSV').first)
        assert len(text.splitlines()) >= 12 and '2025' in text

    def references():
        visit('referentiels')
        page.get_by_placeholder('EUR', exact=True).fill('QAT')
        page.get_by_placeholder('Libellé affiché dans les formulaires').fill('Unité de recette')
        page.get_by_placeholder('€', exact=True).fill('Q')
        page.get_by_placeholder('2', exact=True).fill('2')
        button("Ajouter l'entrée").click()
        page.get_by_placeholder('ex. EUR, Euro…').fill('QAT')
        expect(page.get_by_role('row').filter(has_text='Unité de recette')).to_be_visible()
        assert 'QAT' in download(button('Exporter en CSV'))

    def dashboard():
        visit('tableaux-de-bord')
        button('Personnaliser').click()
        initial_count = button('Masquer').count()
        button('Masquer').first.click()
        page.reload(wait_until='networkidle')
        button('Personnaliser').click()
        expect(button('Masquer')).to_have_count(initial_count - 1)

    def watch_source():
        visit('veille', '')
        page.get_by_role('tab', name='Simulateur').click()
        page.get_by_placeholder('Ex. Veille concurrentielle — secteur X').fill('Veille recette')
        button('Ajouter').click()
        expect(page.get_by_role('row').filter(has_text='Veille recette')).to_be_visible()

    def audit():
        visit('audit-log')
        page.get_by_placeholder('Acteur, entité, détail…').fill('xyz-nonexistent-test')
        expect(page.get_by_role('button', name=re.compile('Exporter en CSV'))).to_be_disabled()
        page.get_by_placeholder('Acteur, entité, détail…').fill('')
        assert len(download(page.get_by_role('button', name=re.compile('Exporter en CSV'))).splitlines()) == 33

    def targeted_notifications():
        visit('notifications-ciblees')
        initial_count = button('Activer').count()
        button('Dupliquer').first.click()
        expect(button('Activer')).to_have_count(initial_count + 1)
        button('Activer').first.click()
        expect(button('Activer')).to_have_count(initial_count)

    def tasks():
        visit('taches')
        button('Démarrer').first.click()
        expect(button('En cours (4)')).to_be_visible()
        button('Terminer').first.click()
        expect(button('Terminé (2)')).to_be_visible()

    def connectors():
        visit('connecteurs')
        row = page.get_by_role('row').filter(has=button('Corriger'))
        expect(row).to_have_count(1)
        row.get_by_role('button', name='Corriger').click()
        page.get_by_placeholder('ex. bpm_reader_v2').fill('svc-recette')
        button("Enregistrer l'identifiant").click()
        expect(button('Corriger')).to_have_count(0)

    def languages():
        visit('multi-langue')
        button('EN — English').click()
        expect(button('Confirm order')).to_be_visible()

    def themes():
        visit('themes')
        page.get_by_role('button', name=re.compile('^ACME Corp')).click()
        theme_config = json.loads(download(button('Exporter JSON')))
        assert '#e11d48' in json.dumps(theme_config)

    def products():
        visit('catalogue-produits')
        button('Nouveau produit').click()
        page.get_by_placeholder('Ex. : Fauteuil Bergen').fill('Chaise recette')
        page.get_by_placeholder('Ex. : 129.90').fill('12')
        page.get_by_placeholder('Ex. : 10').fill('2')
        button('Créer le produit').click()
        row = page.get_by_role('row').filter(has_text='Chaise recette')
        expect(row).to_be_visible()
        row.get_by_role('button', name='Fiche').click()
        button('+1 stock').click()
        expect(button('−1 stock')).to_be_enabled()

    def quotes():
        visit('devis-facturation')
        button('Nouveau devis').click()
        page.get_by_placeholder('Ex. Initech SARL').fill('Atelier Modular')
        button('Créer le devis').click()
        page.get_by_placeholder('Ex. Atelier de cadrage (jour)').fill('Prestation QA')
        page.get_by_placeholder('0,00').fill('100')
        button('Ajouter la ligne').click()
        expect(page.get_by_role('row').filter(has_text='Prestation QA')).to_be_visible()
        button('Envoyer au client').click()
        button('Marquer payé').click()
        expect(button('Ajouter la ligne')).to_be_disabled()

    def forms():
        visit('formulaire-dynamique')
        button('Choisir le type de demande').click()
        choose('Achat de matériel')
        button('Choisir une catégorie').click()
        choose('Mobilier')
        page.get_by_placeholder('0', exact=True).fill('1300')
        page.get_by_placeholder('Matériel demandé, quantité, usage prévu…').fill('Deux bureaux')
        button('Soumettre la demande').click()
        assert page.get_by_text(re.compile('Validation directeur')).count() >= 1
    scenarios = (
        reports, references, dashboard, watch_source, audit, targeted_notifications,
        tasks, connectors, languages, themes, products, quotes, forms,
    )
    for scenario in scenarios:
        scenario()
        print(f"Browser interaction passed: {scenario.__name__}", flush=True)


def verify(origin):
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path=os.environ["MODULAR_TEST_CHROMIUM"])
        try:
            context = browser.new_context(locale="fr-FR", timezone_id="Europe/Paris")
            page = context.new_page()
            page.set_default_timeout(10000)
            check_interactions(page, origin)
        finally:
            browser.close()
