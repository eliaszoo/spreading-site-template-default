import React, { useEffect, useState } from 'react';
import { Tree, Select, Space } from 'antd';
import Router from "next/router";
import { DownOutlined } from '@ant-design/icons';
import type { TreeProps } from 'antd/es/tree';
import { Breadcrumb, Menu, Anchor } from 'antd';
// import useSWR from 'swr';

const { Link } = Anchor;

const LANGUAGES = { "af_za": "Afrikaans", "am_et": "አማርኛ", "ar_ar": "العربية", "as_in": "অসমীয়া", "az_az": "Azərbaycanca", "be_by": "Беларуская", "bg_bg": "Български", "bn_in": "বাংলা", "bs_ba": "Bosanski", "ca_es": "Català", "cs_cz": "Čeština", "cy_gb": "Cymraeg", "da_dk": "Dansk", "de_de": "Deutsch", "el_gr": "Ελληνικά", "en_au": "English (Australia)", "en_ca": "English (Canada)", "en_gb": "English (United Kingdom)", "en_in": "English (India)", "en_sg": "English (Singapore)", "en_us": "English (United States)", "en_za": "English (South Africa)", "eo_eo": "Esperanto", "es_ar": "Español (Argentina)", "es_bo": "Español (Bolivia)", "es_cl": "Español (Chile)", "es_co": "Español (Colombia)", "es_cr": "Español (Costa Rica)", "es_do": "Español (República Dominicana)", "es_ec": "Español (Ecuador)", "es_es": "Español (España)", "es_gt": "Español (Guatemala)", "es_hn": "Español (Honduras)", "es_mx": "Español (México)", "es_ni": "Español (Nicaragua)", "es_pa": "Español (Panamá)", "es_pe": "Español (Perú)", "es_pr": "Español (Puerto Rico)", "es_py": "Español (Paraguay)", "es_sv": "Español (El Salvador)", "es_us": "Español (Estados Unidos)", "es_uy": "Español (Uruguay)", "es_ve": "Español (Venezuela)", "et_ee": "Eesti", "eu_es": "Euskara", "fa_ir": "فارسی", "fi_fi": "Suomi", "fil_ph": "Filipino", "fo_fo": "Føroyskt", "fr_be": "Français (Belgique)", "fr_ca": "Français (Canada)", "fr_ch": "Français (Suisse)", "fr_fr": "Français (France)", "fr_lu": "Français (Luxembourg)", "ga_ie": "Gaeilge", "gl_es": "Galego", "gsw_ch": "Schwiizerdütsch", "gu_in": "ગુજરાતી", "he_il": "עברית", "hi_in": "हिन्दी", "hr_hr": "Hrvatski", "hu_hu": "Magyar", "hy_am": "Հայերեն", "id_id": "Bahasa Indonesia", "ig_ng": "Igbo", "is_is": "Íslenska", "it_ch": "Italiano (Svizzera)", "it_it": "Italiano", "ja_jp": "日本語", "ka_ge": "ქართული", "kk_kz": "Қазақ", "km_kh": "ភាសាខ្មែរ", "kn_in": "ಕನ್ನಡ", "ko_kr": "한국어", "kok_in": "कोंकणी", "ky_kg": "Кыргыz", "lb_lu": "Lëtzebuergesch", "lo_la": "ລາວ", "lt_lt": "Lietuvių", "lv_lv": "Latviešu", "mi_nz": "Te Reo Māori", "mk_mk": "Македонски", "ml_in": "മലയാളം", "mn_mn": "Монгол", "mr_in": "मराठी", "ms_my": "Bahasa Melayu", "mt_mt": "Malti", "nb_no": "Norsk bokmål", "ne_np": "नेपाली", "nl_be": "Nederlands (België)", "nl_nl": "Nederlands", "nn_no": "Norsk nynorsk", "nso_za": "Sesotho sa Leboa", "oc_fr": "Occitan", "or_in": "ଓଡ଼ିଆ", "pa_in": "ਪੰਜਾਬੀ", "pl_pl": "Polski", "prs_af": "دری", "ps_af": "پښتو", "pt_br": "Português (Brasil)", "pt_pt": "Português", "quz_pe": "Runasimi", "ro_ro": "Română", "ru_ru": "Русский", "rw_rw": "Kinyarwanda", "sa_in": "संस्कृत", "sah_ru": "Саха", "se_fi": "Davvisámegiella", "se_no": "Davvisámegiella (Norga)", "se_se": "Davvisámegiella (Suopma)", "si_lk": "සිංහල", "sk_sk": "Slovenčina", "sl_si": "Slovenščina", "sq_al": "Shqip", "sr_cyrl": "Српски (ћирилица)", "sr_cyrl_me": "Српски (ћирилица, Црна Гора)", "sr_latn": "Srpski (latinica)", "sr_latn_me": "Srpski (latinica, Crna Gora)", "sv_fi": "Svenska (Finland)", "sv_se": "Svenska (Sverige)", "sw_ke": "Kiswahili", "ta_in": "தமிழ்", "te_in": "తెలుగు", "tg_tj": "Тоҷикӣ", "th_th": "ไทย", "tk_tm": "Türkmençe", "tn_za": "Setswana", "tr_tr": "Türkçe", "tt_ru": "Татар", "ug_cn": "ئۇيغۇرچە", "uk_ua": "Українська", "ur_in": "اردو", "ur_pk": "اردو (پاکستان)", "uz_uz": "O‘zbek", "vi_vn": "Tiếng Việt", "wo_sn": "Wolof", "xh_za": "isiXhosa", "zh_cn": "简体中文", "zh_hk": "繁體中文 (香港)", "zh_tw": "繁體中文 (台灣)" };
const PREVIEW_KEY = "preview"

type Props = {
    preview?: boolean
    children: React.ReactNode,
    slug?: string[],
    frontmatter: any
}

type TreeDataObject = {
    key: string,
    title: string,
    type: string,
    children?: TreeDataObject[]

}

type TreeWidgetItem = {
    value: string,
    label: string,
    index: number
}

const PreviewLayout = ({ preview, children, slug, frontmatter }: Props) => {
    // const { data, error } = useSWR('/api/tree', (...args) => fetch(...args).then((res) => res.json()));
    // console.log('PreviewLayout useSWR', data);
    // if (error) {
    //     return <div>数据获取失败</div>;
    // }
    // if (!data) {
    //     return <div>正在加载数据...</div>;
    // }

    const isPreview = slug[1] === PREVIEW_KEY
    const [fullTreeData, setFullTreeData] = useState([]);
    const [currentProject, setCurrentProjectObj] = useState({} as TreeDataObject);
    const [currentVersionDataObj, setCurrentVersionDataObj] = useState({} as TreeDataObject);
    const [currentLanguageDataObj, setCurrentLanguageDataObj] = useState({} as TreeDataObject);
    const [versionWidgetItemList, setVersionWidgetItemList] = useState([] as TreeWidgetItem[]);
    const [currentVersionWidgetItem, setCurrentVersionWidgetItem] = useState(null);
    const [languageWidgetItemList, setLanguageWidgetItemList] = useState([] as TreeWidgetItem[]);
    const [currentLanguageWidgetItem, setCurrentLanguageWidgetItem] = useState(null);
    const [currentCollectionDataObj, setCurrentCollectionDataObj] = useState([] as TreeDataObject[]);
    const [treeKey, setTreeKey] = useState(0);
    const [defaultURL, setDefaultURL] = useState([(slug as string[]).join('/')]);
    const [breadcrumbData, setBreadcrumbData] = useState([])

    useEffect(() => {
        // TODO: Store data locally to the browser

        const url = new URL('/api/tree', window.location.href);
        url.searchParams.append("isPreview",isPreview ? "true" : "false")

        fetch(url).then((response) => {
            response.json().then(({ result }) => {
                console.log('fetch fullTreeData', result);
                localStorage.setItem('fullTreeData', JSON.stringify(result));
                setFullTreeData(result);
            });
        });
    }, []);


    useEffect(() => {
        if (fullTreeData.length) {
            const defaultProject = fullTreeData[0];
            setCurrentProjectObj(defaultProject)

            // Version
            const versionInURL = isPreview ? slug[2] : slug[1];
            changeVersion(versionInURL, defaultProject);
        }
    }, [fullTreeData]);

    useEffect(() => {
        var urlPrefixCount = 2; // docs/project
        urlPrefixCount += currentProject.children && currentProject.children.length > 1 ? 1 : 0; // docs/project/version
        urlPrefixCount += currentVersionDataObj.children && currentVersionDataObj.children.length > 1 ? 1 : 0; // docs/project/version/language
        urlPrefixCount += currentLanguageDataObj.children && currentLanguageDataObj.children.length > 1 ? 1 : 0; // docs/project/version/language/platform
        var validSlug = slug.slice(urlPrefixCount)
        validSlug.splice(validSlug.length - 2, 1) // remove real file name from slug
        if (isPreview) {
            validSlug.shift() // remove preview from slug
        }
        setBreadcrumbData(validSlug.map(item => {
            return { title: item }
        }))
    }, [currentProject, currentVersionDataObj, currentLanguageDataObj, currentCollectionDataObj, defaultURL, slug]);

    const changeVersion = (versionName: string, currentProject: TreeDataObject) => {
        // Reset all when change version
        const versionWidgetItemList: TreeWidgetItem[] = currentProject.children.map(
            (item, index) => ({ label: item.title, value: item.key, index })
        );
        const currentVersionWidgetItem = versionWidgetItemList.find(item => item.label === versionName);
        const currentVersionIndex = currentProject.children.findIndex(item => item.title === versionName);
        const currentVersionDataObj = currentProject.children[currentVersionIndex];

        // Language
        const languageWidgetItemList: TreeWidgetItem[] = currentVersionDataObj.children.map(
            (item, index) => ({ label: item.title, value: item.key, index })
        );
        const languageInURL = Object.keys(LANGUAGES).includes(slug[2].toLocaleLowerCase()) ? slug[2].toLocaleLowerCase() : 'en_us';
        const currentLanguageWidgetItem = languageWidgetItemList.find((item) => item.value.split('/').pop().toLocaleLowerCase() === languageInURL);
        const currentLanguageDataObj = currentVersionDataObj.children.find(item => item.key.split("/").pop().toLowerCase() === languageInURL);

        // Collection
        const collectionInURL = currentLanguageDataObj.children.length > 1 ? slug[3] : currentLanguageDataObj.children[0].title;
        const currentCollectionDataObj = currentLanguageDataObj.children.find(item => item.title === collectionInURL).children;

        setVersionWidgetItemList(versionWidgetItemList);
        setCurrentVersionWidgetItem(currentVersionWidgetItem);
        setCurrentVersionDataObj(currentVersionDataObj);
        setLanguageWidgetItemList(languageWidgetItemList);
        setCurrentLanguageWidgetItem(currentLanguageWidgetItem);
        setCurrentLanguageDataObj(currentLanguageDataObj);
        setCurrentCollectionDataObj(currentCollectionDataObj);
        setTreeKey(Date.now());

        return { currentVersionDataObj, currentLanguageDataObj, currentCollectionDataObj }
    }
    const changeLanguage = (languageCode: string, currentProject: TreeDataObject) => {
        const currentVersionIndex = currentProject.children.findIndex(item => item.title === currentVersionWidgetItem.label);
        const currentVersionDataObj = currentProject.children[currentVersionIndex];
        // Language
        const languageWidgetItemList: TreeWidgetItem[] = currentVersionDataObj.children.map(
            (item, index) => ({ label: item.title, value: item.key, index })
        );
        const currentLanguageWidgetItem = languageWidgetItemList.find((item) => item.value.split('/').pop().toLocaleLowerCase() === languageCode);
        const currentLanguageDataObj = currentVersionDataObj.children.find(item => item.key.split("/").pop().toLowerCase() === languageCode);


        // Collection
        const collectionInURL = currentLanguageDataObj.children.length > 1 ? slug[3] : currentLanguageDataObj.children[0].title;
        const currentCollectionDataObj = currentLanguageDataObj.children.find(item => item.title === collectionInURL).children;

        setLanguageWidgetItemList(languageWidgetItemList);
        setCurrentLanguageWidgetItem(currentLanguageWidgetItem);
        setCurrentLanguageDataObj(currentLanguageDataObj);
        setCurrentCollectionDataObj(currentCollectionDataObj);
        setTreeKey(Date.now());
    }
    const changeCollection = (collectionName) => {

    }

    const fileSelectHandle: TreeProps['onSelect'] = (selectedKeys, info) => {
        console.log('fileSelectHandle', selectedKeys, info);
        const { node } = info as any;
        if (node.type === 'file') {
            Router.push(`${node.key}`);
        }
    }
    const versionChangeHandle = (value, option) => {
        console.log('versionChangeHandle', value, option);
        const { currentCollectionDataObj } = changeVersion(option.label, fullTreeData[0]);

        const path = currentCollectionDataObj[0].key;
        Router.push(path);
        setDefaultURL([path]);
    }
    const languageChangeHandle = (value, option) => {
        console.log('languageChangeHandle', value, option);
        changeLanguage(option.value.split("/").pop().toLowerCase(), fullTreeData[0])

        var pathSuffix = (slug as string[]).slice(3).join('/');
        const path = `${value.value}/${pathSuffix}`;
        Router.push(path);
        setDefaultURL([path]);
    }
    const collectionChangeHandler = (value, option) => {
        // This version does not support change collection
    }
    const expandHandle = (expandedKeys, { expanded: bool, node }) => {

    }

    const renderTocItems = (items) => {
        return items.map((item) => (
            <Link key={item.url} href={item.url} title={item.title}>
                {item.children && renderTocItems(item.children)}
            </Link>
        ));
    };
    const formatFrontmatterTocForAntdAnchor = (data, k) => {
        let key = k;

        return data.map((item) => {
            const newItem = { ...item };

            newItem.href = newItem.url;
            delete newItem.url;
            newItem.key = key++;

            if (newItem.children) {
                newItem.children = formatFrontmatterTocForAntdAnchor(newItem.children, key);
            }

            return newItem;
        });
    };

    return (
        <>
            <div className="min-h-screen preview-screen">
                <header className="preview-header">
                    Spreading
                    <Space wrap>
                        <Select
                            labelInValue
                            value={currentVersionWidgetItem}
                            style={{ width: 120 }}
                            onChange={versionChangeHandle}
                            options={versionWidgetItemList}
                        />
                        <Select
                            labelInValue
                            style={{ width: 120 }}
                            value={currentLanguageWidgetItem}
                            onChange={languageChangeHandle}
                            options={languageWidgetItemList}
                        />
                    </Space>
                </header>
                <main className="preview-main">
                    <div className="preview-sider">
                        <Tree
                            key={treeKey}
                            showLine
                            // @ts-ignore
                            switcherIcon={<DownOutlined />}
                            defaultExpandAll={true}
                            defaultSelectedKeys={defaultURL}
                            onSelect={fileSelectHandle}
                            onExpand={expandHandle}
                            treeData={currentCollectionDataObj}
                        />
                    </div>
                    <div className="preview-content">
                        <Breadcrumb items={breadcrumbData} />
                        {children}
                    </div>
                    {frontmatter.toc ? <Anchor items={formatFrontmatterTocForAntdAnchor(frontmatter.toc, 0)} affix={false} className="preview-toc" /> : null}
                </main>
            </div>
        </>
    );
};

export default PreviewLayout;