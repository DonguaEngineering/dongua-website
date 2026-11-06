import {
    copyFile,
    readFile,
    writeFile,
} from 'node:fs/promises';

const sourcePath = 'src/locale/messages.xlf';
const targetPath = 'src/locale/messages.es.xlf';
const translationsPath = 'src/locale/es.translations.json';
const backupPath = 'src/locale/messages.es.sync-backup.xlf';

/* =========================================================
   XML HELPERS
   ========================================================= */

function escapeXml(text) {
    return text
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&apos;');
}

function extractUnits(xml) {
    const units = new Map();

    const regex =
        /<trans-unit\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/trans-unit>/g;

    for (const match of xml.matchAll(regex)) {
        units.set(match[1], {
            full: match[0],
            body: match[2],
        });
    }

    return units;
}

function getElementContent(body, elementName) {
    const regex = new RegExp(
        `<${elementName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${elementName}>`,
    );

    return body.match(regex)?.[1] ?? null;
}

function getTarget(body) {
    const match = body.match(
        /<target([^>]*)>([\s\S]*?)<\/target>/,
    );

    if (!match) {
        return null;
    }

    const state =
        match[1].match(/\bstate="([^"]+)"/)?.[1] ?? null;

    return {
        content: match[2],
        state,
    };
}

function removeTarget(body) {
    return body.replace(
        /\s*<target(?:\s[^>]*)?>[\s\S]*?<\/target>/,
        '',
    );
}

function insertTarget(body, targetElement) {
    const closingSource = '</source>';
    const position = body.indexOf(closingSource);

    if (position === -1) {
        throw new Error(
            'Could not find </source> inside a trans-unit.',
        );
    }

    const insertionPoint =
        position + closingSource.length;

    return (
        body.slice(0, insertionPoint) +
        `\n        ${targetElement}` +
        body.slice(insertionPoint)
    );
}

function normalize(content) {
    return content
        .replace(/\s+/g, ' ')
        .trim();
}

/* =========================================================
   XLIFF PLACEHOLDERS
   ========================================================= */

/*
 * Angular represents inline HTML elements with <x ... /> tags.
 *
 * Examples:
 *
 * <x id="LINE_BREAK" .../>
 * <x id="START_TAG_SPAN" .../>
 * <x id="CLOSE_TAG_SPAN" .../>
 *
 * In es.translations.json we reference them as:
 *
 * {{LINE_BREAK}}
 * {{START_TAG_SPAN}}
 * {{CLOSE_TAG_SPAN}}
 */

function extractPlaceholders(sourceContent) {
    const placeholders = new Map();

    const regex =
        /<x\b[^>]*\bid="([^"]+)"[^>]*\/>/g;

    for (const match of sourceContent.matchAll(regex)) {
        placeholders.set(
            match[1],
            match[0],
        );
    }

    return placeholders;
}

function buildTranslatedContent(
    translationTemplate,
    sourceContent,
    id,
) {
    const placeholders =
        extractPlaceholders(sourceContent);

    /*
     * Split the translation around {{PLACEHOLDER_ID}}
     * tokens. Normal text is XML-escaped, while Angular's
     * original <x /> elements are inserted untouched.
     */
    const tokenRegex = /\{\{([A-Z0-9_]+)\}\}/g;

    let output = '';
    let lastIndex = 0;

    for (
        const match of translationTemplate.matchAll(tokenRegex)
    ) {
        const tokenStart = match.index;
        const tokenEnd =
            tokenStart + match[0].length;

        /*
         * Escape normal translated text before the token.
         */
        output += escapeXml(
            translationTemplate.slice(
                lastIndex,
                tokenStart,
            ),
        );

        const placeholderId = match[1];

        const placeholder =
            placeholders.get(placeholderId);

        if (!placeholder) {
            throw new Error(
                [
                    `Unknown placeholder in translation "${id}".`,
                    `Token: {{${placeholderId}}}`,
                    `Available placeholders: ${
                        [...placeholders.keys()].join(', ') ||
                        'none'
                    }`,
                ].join('\n'),
            );
        }

        output += placeholder;

        lastIndex = tokenEnd;
    }

    /*
     * Remaining text after the final token.
     */
    output += escapeXml(
        translationTemplate.slice(lastIndex),
    );

    /*
     * Validate that every placeholder present in the English
     * source is also represented in the translation.
     */
    for (const placeholderId of placeholders.keys()) {
        const token =
            `{{${placeholderId}}}`;

        if (!translationTemplate.includes(token)) {
            throw new Error(
                [
                    `Missing placeholder in translation "${id}".`,
                    `Required token: ${token}`,
                ].join('\n'),
            );
        }
    }

    return output;
}

/* =========================================================
   LOAD FILES
   ========================================================= */

const sourceXml = await readFile(
    sourcePath,
    'utf8',
);

const existingSpanishXml = await readFile(
    targetPath,
    'utf8',
);

const translations = JSON.parse(
    await readFile(
        translationsPath,
        'utf8',
    ),
);

/*
 * Automatic backup before each sync.
 */
await copyFile(
    targetPath,
    backupPath,
);

const sourceUnits =
    extractUnits(sourceXml);

const existingUnits =
    extractUnits(existingSpanishXml);

/* =========================================================
   SYNCHRONISE
   ========================================================= */

let applied = 0;
let preserved = 0;
let migrated = 0;
let changed = 0;
let added = 0;
let removed = 0;

const untranslatedIds = [];
const reviewIds = [];

const rebuiltUnits = [];

for (const [id, sourceUnit] of sourceUnits) {
    const english =
        getElementContent(
            sourceUnit.body,
            'source',
        ) ?? '';

    const existingUnit =
        existingUnits.get(id);

    let spanish = null;
    let state = null;

    /* -----------------------------------------------------
       Explicit translation dictionary
       ----------------------------------------------------- */

    if (
        Object.prototype.hasOwnProperty.call(
            translations,
            id,
        )
    ) {
        spanish = buildTranslatedContent(
            translations[id],
            english,
            id,
        );

        applied++;
    }

    /* -----------------------------------------------------
       Existing modern XLIFF translation
       ----------------------------------------------------- */

    else if (existingUnit) {
        const previousSource =
            getElementContent(
                existingUnit.body,
                'source',
            );

        const previousTarget =
            getTarget(
                existingUnit.body,
            );

        if (
            previousTarget &&
            previousTarget.content.trim() !== ''
        ) {
            spanish =
                previousTarget.content;

            /*
             * Still untranslated.
             */
            if (
                previousTarget.state === 'new'
            ) {
                state = 'new';

                untranslatedIds.push(id);
            }

            /*
             * English source unchanged.
             */
            else if (
                normalize(previousSource ?? '') ===
                normalize(english)
            ) {
                preserved++;

                state =
                    previousTarget.state;
            }

            /*
             * English changed after translation.
             */
            else {
                changed++;

                state =
                    'needs-review-translation';

                reviewIds.push(id);
            }
        }

        /* -------------------------------------------------
           Legacy Dongua format

           <source>Spanish translation</source>
           ------------------------------------------------- */

        else if (
            previousSource !== null &&
            previousSource.trim() !== ''
        ) {
            spanish =
                previousSource;

            migrated++;
        }
    }

    /* -----------------------------------------------------
       Completely new untranslated unit
       ----------------------------------------------------- */

    if (spanish === null) {
        spanish = english;
        state = 'new';

        added++;
        untranslatedIds.push(id);
    }

    let body =
        removeTarget(
            sourceUnit.body,
        );

    const stateAttribute =
        state
            ? ` state="${state}"`
            : '';

    body = insertTarget(
        body,
        `<target${stateAttribute}>${spanish}</target>`,
    );

    rebuiltUnits.push(
        sourceUnit.full.replace(
            sourceUnit.body,
            body,
        ),
    );
}

/* =========================================================
   REMOVED IDs
   ========================================================= */

for (const id of existingUnits.keys()) {
    if (!sourceUnits.has(id)) {
        removed++;
    }
}

/* =========================================================
   REBUILD XLIFF
   ========================================================= */

const rebuiltBody =
    `<body>\n` +
    rebuiltUnits.join('\n') +
    `\n    </body>`;

let output = sourceXml.replace(
    /<body>[\s\S]*?<\/body>/,
    rebuiltBody,
);

/*
 * Ensure Spanish target language.
 */
if (
    /target-language="[^"]+"/.test(output)
) {
    output = output.replace(
        /target-language="[^"]+"/,
        'target-language="es"',
    );
} else {
    output = output.replace(
        /source-language="([^"]+)"/,
        'source-language="$1" target-language="es"',
    );
}

/* =========================================================
   WRITE
   ========================================================= */

await writeFile(
    targetPath,
    output,
    'utf8',
);

/* =========================================================
   REPORT
   ========================================================= */

console.log('');
console.log(
    'Spanish translations synchronized.',
);
console.log('');

console.log(`Applied:       ${applied}`);
console.log(`Preserved:     ${preserved}`);
console.log(`Migrated:      ${migrated}`);
console.log(`Changed:       ${changed}`);
console.log(`Added:         ${added}`);
console.log(`Removed:       ${removed}`);
console.log(
    `Untranslated:  ${untranslatedIds.length}`,
);
console.log(
    `Needs review:  ${reviewIds.length}`,
);

if (untranslatedIds.length > 0) {
    console.log('');
    console.log('Untranslated IDs:');

    for (const id of untranslatedIds) {
        console.log(`  - ${id}`);
    }
}

if (reviewIds.length > 0) {
    console.log('');
    console.log(
        'Translation IDs to review:',
    );

    for (const id of reviewIds) {
        console.log(`  - ${id}`);
    }
}

console.log('');
console.log(
    `Backup created: ${backupPath}`,
);
console.log('');