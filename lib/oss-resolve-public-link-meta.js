// Remplacement minimal et fonctionnel de l'ee branding manquant.
// Respecte le comportement OSS : on garde les metatags du lien, pas d'override branding.
function resolvePublicLinkMeta(input) {
  const link = (input && input.link) || {};

  return {
    enableCustomMetatag: !!link.enableCustomMetatag,
    metaTitle:
      link.metaTitle != null
        ? link.metaTitle
        : (input && input.defaultTitle) || null,
    metaDescription: link.metaDescription != null ? link.metaDescription : null,
    metaImage: link.metaImage != null ? link.metaImage : null,
    metaFavicon: link.metaFavicon != null ? link.metaFavicon : "/favicon.ico",
  };
}

module.exports = { resolvePublicLinkMeta };
