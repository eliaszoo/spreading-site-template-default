import React from 'react';
import { Tree, Select, Space } from 'antd';
import Router from "next/router";
import { DownOutlined } from '@ant-design/icons';
import type { TreeProps } from 'antd/es/tree';
import { Breadcrumb } from 'antd';

type Props = {
    preview?: boolean
    children: React.ReactNode,
    fullTreeData?: [],
    slug?: string[],
}

const PreviewLayout = ({ preview, children, fullTreeData, slug }: Props) => {
    console.log('PreviewLayout slug', fullTreeData, slug);

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

    const selectHandle: TreeProps['onSelect'] = (selectedKeys, info) => {
        console.log('selectHandle', selectedKeys, info);
        const { node } = info as any;
        if (node.type === 'file') {
            Router.push(`${node.key}`);
        }
    };
    const versionChangeHandle = (value, option) => {
        console.log('versionChangeHandle', value, option);
        // @ts-ignore
        const key = fullTreeData[0].children[option.index].children[0].children[0].key;
        Router.push(key);
    }
    const languageChangeHandle = (value, option) => {
        console.log('languageChangeHandle', value, option);
        const temp = (slug as string[]).slice(3).join('/');
        Router.push(`${value.value}/${temp}`);
    }
    
    return (
        <>
            <div className="min-h-screen preview-screen">
                <header className="preview-header">
                    Spreading
                    <Space wrap>
                        <Select
                            labelInValue
                            defaultValue={defaultVersion}
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
                            showLine
                            // @ts-ignore
                            switcherIcon={<DownOutlined />}
                            defaultExpandAll={true}
                            defaultSelectedKeys={[(slug as string[]).join('/')]}
                            onSelect={selectHandle}
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
    // return (<div>{children}</div>);
};

export default PreviewLayout;