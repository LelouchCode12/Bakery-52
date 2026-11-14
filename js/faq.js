$(function () {
    initFaq();
});

function initFaq() {
    const $questions = $(".faq-question");
    const $status    = $(".faq-status");

    if (!$questions.length) return;

    const showStatus = (text) => {
        $status.stop(true, true).text(text).fadeTo(200, 1).delay(1500).fadeTo(400, 0);
    };

    $questions.on("click", function () {
        const $btn    = $(this);
        const $panel  = $("#" + $btn.attr("aria-controls"));
        const willOpen = $btn.attr("aria-expanded") === "false";

        if (willOpen) {
            $questions.not($btn).each(function () {
                const $otherBtn = $(this);
                if ($otherBtn.attr("aria-expanded") === "true") {
                    $otherBtn.attr("aria-expanded", "false");
                    $("#" + $otherBtn.attr("aria-controls")).stop(true, true).slideUp(250);
                }
            });
        }

        $btn.attr("aria-expanded", String(willOpen));
        $panel.stop(true, true).slideToggle(250);
        showStatus(willOpen ? "Answer opened" : "Answer closed");
    });

    $questions.on("keydown", function (e) {
        const index  = $questions.index(this);
        const last   = $questions.length - 1;
        let target   = null;

        if      (e.key === "ArrowDown") target = index === last ? 0 : index + 1;
        else if (e.key === "ArrowUp")   target = index === 0 ? last : index - 1;
        else if (e.key === "Home")      target = 0;
        else if (e.key === "End")       target = last;

        if (target !== null) {
            e.preventDefault();
            $questions.eq(target).trigger("focus");
        }
    });
}
