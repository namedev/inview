/**
 * 
 * @param {HTMLElement} element 
 * @param {{ 
 *      threshold: number, 
 *      once: boolean, 
 *      classInview: 'inview' | string, 
 *      delay?: number, 
 *      onInit?: Function, 
 *      onInview?: Function 
 * }} options
 * @returns 
 */
function inView(element, options) {
    const _attr = {
        dataInview: 'data-inview',
        dataInviewInit: 'data-inview-init',
        clsDefaultInview: 'inview-default',
    };

    if (typeof element === 'undefined') {
        element = document.querySelectorAll('[' + _attr.dataInview + ']');
    }
    // ?mutant
    element = element instanceof NodeList ? element : [element];
    
    if (element.length <= 0) return;

    const fn = {
        render: function (observer, entry, customAttribute) {
            setTimeout(() => {
                this.setInview(entry.target, customAttribute);
            }, 100);

            if (opt.once) this.removeObserve(observer, entry.target);
        },
        prepareInview: function (element, customAttribute) {
            if (!element.hasAttribute(_attr.dataInview)) {
                element.setAttribute(_attr.dataInview, '');
            }
            element.classList.add(customAttribute['cls'] || _attr.clsDefaultInview);
            opt.onInit(element);
        },
        setInview: function (element, customAttribute) {
            element.setAttribute(_attr.dataInviewInit, true);
            element.classList.add(opt.classInview);
            opt.onInview(element);
        },
        removeObserve: function (observe, element) {
            observe.unobserve(element);
        },
        getDataObject: function (element) {
            let attributeValue = element.getAttribute(_attr.dataInview);
            if (!attributeValue || typeof attributeValue !== 'string') {
                return {};
            }
            let obj = {};
            let records = attributeValue.split(';');

            for (const element of records) {
                let record = element.trim();
                if (!record) continue;

                let parts = record.split(':');
                if (parts.length < 2) continue;

                let key = parts[0].trim();
                let value = parts[1].trim();

                if (!key) continue;

                let num = Number(value);
                obj[key] = isNaN(num) ? value : num;
            }

            return obj;
        },
        calOffset: function(threshold) {
            if (typeof threshold === 'undefined') return threshold;
            const thresholdInt = parseInt(threshold);
            if (thresholdInt > 100) {
                return;
            }

            return thresholdInt / 100;
        }
    };

    if (typeof options !== 'object') options = {};
    const opt = Object.assign(
        {
            threshold: 0,
            once: true,
            classInview: 'inview',
            delay: 0,
            onInit: function () {},
            onInview: function () {},
        },
        options
    );

    const callback = (entries, observer) => {
        entries.forEach((entry) => {
            const customAttribute = fn.getDataObject(entry.target);

            if (entry.isIntersecting) {
                setTimeout(
                    () => fn.render(observer, entry, customAttribute),
                    customAttribute['delay'] || opt.delay
                );
            }
        });
    };
    element.forEach((item) => {
        if (item.hasAttribute('[data-inview-init="true"]')) return;
        const customAttribute = fn.getDataObject(item);
        fn.prepareInview(item, customAttribute);

        const observer = new IntersectionObserver(callback, {
            threshold: fn.calOffset(customAttribute['offset']) || opt.threshold,
        });

        observer.observe(item);
    });
}
