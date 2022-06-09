import os
import sys

extensions = [
    'sphinx.ext.autosectionlabel',
    ]

intersphinx_mapping = {
    # 'sphinx': ('https://www.sphinx-doc.org/en/master/', None),
}
# The suffix of source filenames.
source_suffix = '.rst'

# The master toctree document.
master_doc = 'toc'

# General information about the project.
project = u'Elwood Trading Platform'
copyright = u'2022, Elwood.'

# The name of the Pygments (syntax highlighting) style to use.
pygments_style = 'sphinx'

# -- Options for HTML output ---------------------------------------------------

templates_path = ['./_rtdtemplates']

html_theme = 'sphinx_rtd_theme'

# override the default css
html_context = {
    'css_files': [
        '_static/theme_overrides.css',  
        ],
     }
     
# Theme options are theme-specific and customize the look and feel of a theme
# further.  For a list of options available for each theme, see the documentation.

html_theme_options = {
    'canonical_url': 'https://elwood.io/',
    'logo_only': False,
    'display_version': False,
    'prev_next_buttons_location': 'top',
    'style_external_links': False,
    'style_nav_header_background': '',
    # Toc options
    'collapse_navigation': False,
    'sticky_navigation': True,
    'navigation_depth': 4,
    'includehidden': True,
    'titles_only': False
}

# The name for this set of Sphinx documents.  If None, it defaults to
# "<project> v<release> documentation".
html_title = "Elwood Platform"

# A shorter title for the navigation bar.  Default is the same as html_title.
# maps to shorttitle|e
html_short_title = "Elwood Trading Platform"

# The name of an image file (relative to this directory) to place at the top
# of the sidebar.
#html_logo = "logo.png"

# Output file base name for HTML help builder.
htmlhelp_basename = 'Admin'

# The name of an image file (within the static path) to use as favicon of the
# docs.  This file should be a Windows icon file (.ico) being 16x16 or 32x32
# pixels large.
html_favicon = 'favicon.ico'

# If not '', a 'Last updated on:' timestamp is inserted at every page bottom,
# using the given strftime format.
html_last_updated_fmt = '%b %d, %Y'


# If false, no index is generated.
html_use_index = False

# If true, the index is split into individual pages for each letter.
#html_split_index = False

# Changes has_source value in HTML output. 
html_copy_source = False

# If true, links to the reST sources are added to the pages.
html_show_sourcelink = False

# If true, "Created using Sphinx" is shown in the HTML footer. Default is True.
html_show_sphinx = False

# If true, "(C) Copyright ..." is shown in the HTML footer. Default is True.
html_show_copyright = True
