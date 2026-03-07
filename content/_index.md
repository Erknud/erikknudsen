---
# Leave the homepage title empty to use the site title
title:
date: 2022-10-24
type: landing

sections:
  - block: about.avatar
    id: about
    content:
      # Choose a user profile to display (a folder name within `content/authors/`)
      username: admin
      # Override your bio text from `authors/admin/_index.md`?
      text:
  - block: features
    content:
      title: Research Expertise
      items:
        - name: Political Communication
          description: Effects of news use, framing, agenda setting, and media's influence on public opinion and political institutions.
          icon: newspaper
          icon_pack: fas
        - name: Quantitative Methods
          description: Experimental research design, conjoint analyses, survey research, and advanced statistical methods.
          icon: chart-line
          icon_pack: fas
        - name: News Recommender Systems
          description: How algorithmic curation shapes selective exposure, polarization, and democratic participation.
          icon: robot
          icon_pack: fas
  - block: experience
    content:
      title: Experience
      date_format: Jan 2006
      items:
        - title: Professor of Communication Science
          company: University of Bergen
          company_url: 'https://www.uib.no/en/infomedia'
          location: Bergen, Norway
          date_start: '2026-01-01'
          date_end: ''
          description: |2-
              Professor at the Department of Information Science and Media Studies. Research areas include political communication, news use, selective exposure, and affective polarization. PI of NEWSREC project. Editor-in-chief of *Norsk medietidsskrift*. Member of the Young Academy of Norway.
        - title: Associate Professor of Communication Science
          company: University of Bergen
          company_url: 'https://www.uib.no/en/infomedia'
          location: Bergen, Norway
          date_start: '2020-01-01'
          date_end: '2025-12-31'
          description: Research on news recommender systems, trust in journalism, and polarization. Founded the Norwegian Journalism Panel and PADKOM research group at DIGSSCORE.
        - title: Postdoctoral Researcher
          company: DIGSSCORE, University of Bergen
          company_url: 'https://www.uib.no/en/digsscore'
          location: Bergen, Norway
          date_start: '2018-01-01'
          date_end: '2019-12-31'
          description: Postdoctoral research at the Digital Social Science Core Facility (DIGSSCORE).
    design:
      columns: '2'
  - block: accomplishments
    content:
      title: 'Grants & Recognition'
      subtitle:
      date_format: Jan 2006
      items:
        - certificate_url: ''
          date_end: ''
          date_start: '2021-01-01'
          description: 'PI of NEWSREC – The Double-edged Sword of News Recommenders' Impact on Democracy. Awarded through the Research Projects for Young Talents program of the Research Council of Norway.'
          organization: Research Council of Norway
          organization_url: 'https://www.forskningsradet.no/en/'
          title: NEWSREC Project Grant (Young Talents)
          url: ''
        - certificate_url: ''
          date_end: ''
          date_start: '2021-01-01'
          description: 'Elected member of the Young Academy of Norway (Det Unge Akademi).'
          organization: The Norwegian Academies of Science and Letters
          organization_url: 'https://www.dnva.no/en/young-academy'
          title: Young Academy of Norway
          url: ''
        - certificate_url: ''
          date_end: ''
          date_start: '2020-01-01'
          description: 'Work Package Leader at the MediaFutures Research Centre for Responsible Media Technology and Innovation.'
          organization: MediaFutures
          organization_url: 'https://mediafutures.no'
          title: MediaFutures Work Package Leader
          url: ''
    design:
      columns: '2'
  - block: collection
    id: featured
    content:
      title: Featured Publications
      filters:
        folders:
          - publication
        featured_only: true
    design:
      columns: '2'
      view: card
  - block: collection
    content:
      title: Recent Publications
      text: |-
        {{% callout note %}}
        See my full publication list on [Google Scholar](https://scholar.google.com/citations?user=RFS6YrwAAAAJ&hl=en).
        {{% /callout %}}
      filters:
        folders:
          - publication
        exclude_featured: true
    design:
      columns: '2'
      view: citation
  - block: tag_cloud
    content:
      title: Research Topics
    design:
      columns: '2'
  - block: contact
    id: contact
    content:
      title: Contact
      subtitle:
      text: |-
        Feel free to reach out regarding research collaborations, media inquiries, or questions about my work.
      email: erik.knudsen@uib.no
      phone: '+47 97676173'
      address:
        street: Fosswinckels gate 6
        city: Bergen
        postcode: '5007'
        country: Norway
        country_code: 'NO'
      directions: Department of Information Science and Media Studies, University of Bergen
      autolink: true
      form:
        provider: netlify
        formspree:
          id:
        netlify:
          captcha: false
    design:
      columns: '2'
---
