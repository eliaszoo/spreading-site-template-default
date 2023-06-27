import React, { useEffect, useState } from 'react';
import { Tree } from 'antd';
import Router, { useRouter } from "next/router"
import { DownOutlined } from '@ant-design/icons';
import type { TreeProps } from 'antd/es/tree';
import { Breadcrumb } from 'antd';
import { getFullTreeData } from '../lib/docs';

// export const getStaticProps = async ({ params }) => {
//     const fullTreeData = getFullTreeData();
//     return {
//       props: {
//         fullTreeData,
//       },
//         revalidate: 60, // In seconds
//     };
// };

type Props = {
    preview?: boolean
    children: React.ReactNode,
    fullTreeData?: [],
}
  
const PreviewLayout = ({ preview, children, fullTreeData = []}: Props) => {
    const router = useRouter();
    console.log('PreviewLayout router', router);
    const selectHandle: TreeProps['onSelect'] = (selectedKeys, info) => {
        console.log('selectHandle', selectedKeys, info);
        const { node } = info as any;
        if (node.type === 'file') {
            setPath(node.key);
            Router.push(`${node.key}`);
        }
    };
    const rightClickHandle = ({ event, node }) => {
        console.log('rightClickHandle', node);
    };

    const [path, setPath] = useState((router.query.slug as string[]).join('/'));
    const [breadcrumbData, setBreadcrumbData] = useState([]);
    const [defaultSelectedKeys, setDefaultSelectedKeys] = useState([]);

    useEffect(() => {
        console.log(path);
        const temp = path.split('/');
        const breadcrumbData = temp.map((item: string, index: number) => {
            return {
                title: item,
            }
        });
        setBreadcrumbData(breadcrumbData);
        setDefaultSelectedKeys([path]);
    }, [path]);

    return (
        <>
            <div className="min-h-screen preview-screen">
                <header className="preview-header">top</header>
                <main className="preview-main">
                    <div className="preview-sider">
                        <Tree
                            showLine
                            // @ts-ignore
                            switcherIcon={<DownOutlined />}
                            defaultExpandAll={true}
                            defaultSelectedKeys={defaultSelectedKeys}
                            onSelect={selectHandle}
                            treeData={fullTreeData}
                            onRightClick={rightClickHandle}
                        />
                    </div>
                    <div className="preview-content">
                        <Breadcrumb items={breadcrumbData} />
                        {children}
                    </div>
                </main>
            </div>
        </>
    );
};

export default PreviewLayout;