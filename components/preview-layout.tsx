import React, { useEffect, useState } from 'react';
import { Tree, Select, Space } from 'antd';
import Router from "next/router";
import { DownOutlined } from '@ant-design/icons';
import type { TreeProps } from 'antd/es/tree';
import { Breadcrumb } from 'antd';
// import useSWR from 'swr';

type Props = {
    preview?: boolean
    children: React.ReactNode,
    slug?: string[],
}

const PreviewLayout = ({ preview, children, slug }: Props) => {
    // const { data, error } = useSWR('/api/tree', (...args) => fetch(...args).then((res) => res.json()));
    // console.log('PreviewLayout useSWR', data);
    // if (error) {
    //     return <div>数据获取失败</div>;
    // }
    // if (!data) {
    //     return <div>正在加载数据...</div>;
    // }

    const [fullTreeData, setFullTreeData] = useState([]);
    const [defaultVersionList, setDefaultVersionList] = useState([]);
    const [defaultVersion, setDefaultVersion] = useState(null);
    const [defaultLanguageList, setDefaultLanguageList] = useState([]);
    const [defaultLanguage, setDefaultLanguage] = useState(null);
    const [defaultTreeData, setDefaultTreeData] = useState([]);
    const [treeKey, setTreeKey] = useState(0);
    const [defaultSelectedKeys, setDefaultSelectedKeys] = useState([(slug as string[]).join('/')]);
    
    useEffect(() => {
        let fullTreeData;
        const temp = localStorage.getItem('fullTreeData');
        if (temp) {
            fullTreeData = JSON.parse(temp);
            console.log('localStorage fullTreeData', fullTreeData);
            setFullTreeData(fullTreeData);
        } else {
            fetch('/api/tree').then((response) => {
                response.json().then(({ result }) => {
                    console.log('fetch fullTreeData', result);
                    localStorage.setItem('fullTreeData', JSON.stringify(result));
                    setFullTreeData(result);
                });
            });
        }
    }, []);

    useEffect(() => {
        if (fullTreeData.length) {
            // @ts-ignore
            const defaultVersionList = fullTreeData[0].children.map(
                (item, index) => ({ label: item.title, value: item.key, index })
            );
            const defaultVersion = defaultVersionList.find(item => item.label === slug[1]);

            // @ts-ignore
            const versionIndex = fullTreeData[0].children.findIndex(item => item.title === defaultVersion.label);
            // @ts-ignore
            const defaultLanguageList = fullTreeData[0].children[versionIndex].children.map(
                (item, index) => ({ label: item.title, value: item.key, index })
            );
            const defaultLanguage = defaultLanguageList.find(item => item.label === slug[2]);

            // @ts-ignore
            const defaultTreeData = fullTreeData[0].children[versionIndex].children.find(item => item.title === defaultLanguage.label).children;

            setDefaultVersionList(defaultVersionList);
            setDefaultVersion(defaultVersion);
            setDefaultLanguageList(defaultLanguageList);
            setDefaultLanguage(defaultLanguage);
            setDefaultTreeData(defaultTreeData);
            setTreeKey(Date.now());
        }
    }, [fullTreeData]);

    useEffect(() => {
        if (fullTreeData.length) {
            console.log(defaultVersion, defaultLanguage);
            const treeData = fullTreeData[0].children[defaultVersion.index].children[defaultLanguage.index].children;
            setDefaultTreeData(treeData);
            setTreeKey(Date.now());
        }
    }, [defaultVersion, defaultLanguage]);

    const selectHandle: TreeProps['onSelect'] = (selectedKeys, info) => {
        console.log('selectHandle', selectedKeys, info);
        const { node } = info as any;
        if (node.type === 'file') {
            Router.push(`${node.key}`);
        }
    }
    const expandHandle = (expandedKeys, {expanded: bool, node}) => {
        
    }
    const versionChangeHandle = (value, option) => {
        console.log('versionChangeHandle', value, option);
        setDefaultVersion(option);
        const languageList = fullTreeData[0].children[option.index].children.map((item, index) => ({ label: item.title, value: item.key, index }));
        setDefaultLanguageList(languageList);
        setDefaultLanguage(languageList[0]);
        // @ts-ignore
        const path = fullTreeData[0].children[option.index].children[0].children[0].key;
        Router.push(path);
        setDefaultSelectedKeys([path]);
    }
    const languageChangeHandle = (value, option) => {
        console.log('languageChangeHandle', value, option);
        setDefaultLanguage(option);
        const temp = (slug as string[]).slice(3).join('/');
        const path = `${value.value}/${temp}`;
        Router.push(path);
        setDefaultSelectedKeys([path]);
    }
    
    return (
        <>
            <div className="min-h-screen preview-screen">
                <header className="preview-header">
                    Spreading
                    <Space wrap>
                        <Select
                            labelInValue
                            value={defaultVersion}
                            style={{ width: 120 }}
                            onChange={versionChangeHandle}
                            options={defaultVersionList}
                        />
                        <Select
                            labelInValue
                            style={{ width: 120 }}
                            value={defaultLanguage}
                            onChange={languageChangeHandle}
                            options={defaultLanguageList}
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
                            defaultSelectedKeys={defaultSelectedKeys}
                            onSelect={selectHandle}
                            onExpand={expandHandle}
                            treeData={defaultTreeData}
                        />
                    </div>
                    <div className="preview-content">
                        <Breadcrumb items={(slug as string[]).map((item: string, index: number) => {
                            return { title: item }
                        })} />
                        {children}
                    </div>
                </main>
            </div>
        </>
    );
};

export default PreviewLayout;