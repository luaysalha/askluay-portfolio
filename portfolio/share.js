// Share button: native share sheet where available, otherwise copy the link.
document.querySelectorAll('[data-share]').forEach(function (button) {
  var status = button.parentElement.querySelector('.share-status');
  var canonical = document.querySelector('link[rel="canonical"]');
  var description = document.querySelector('meta[name="description"]');
  var data = {
    title: document.title,
    text: description ? description.content : '',
    url: canonical ? canonical.href : location.href
  };
  function say(message) {
    if (!status) return;
    status.textContent = message;
    clearTimeout(say.timer);
    say.timer = setTimeout(function () { status.textContent = ''; }, 4000);
  }
  button.addEventListener('click', function () {
    if (navigator.share) {
      navigator.share(data).catch(function () {});
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(data.url).then(
        function () { say('Link copied'); },
        function () { say(data.url); }
      );
    } else {
      say(data.url);
    }
  });
});
