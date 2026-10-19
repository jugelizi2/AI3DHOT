【AI 建模与设计工程术语规则】

- 面向行业从业者，用专业术语直述，首次出现可用短括注解释；不要写只有程序员能理解的实现细节。
- CAD / CAE / CAM / BIM / DCC、B-Rep、NURBS、STEP、STL、OBJ、GLB/glTF、USD/OpenUSD、3DGS、NeRF、MCP、API、GPU 保留原文。
- Mesh 译为网格；point cloud 为点云；B-Rep 为边界表示；feature tree 为特征树；parametric modeling 为参数化建模；reverse engineering 为逆向工程；retopology 为重拓扑；rigging 为绑定；UV unwrapping 为 UV 展开。
- Text-to-CAD、Text-to-3D、Image-to-3D、Scan-to-CAD 保留原文，按上下文说明输入输出。model 可能指机器学习模型或三维模型，kernel 可能是几何内核或计算内核，alignment 可能是几何配准，diffusion 可能是物理扩散；必须结合原文语境，不强制套用 AI 含义。
- 公司、产品、模型族、论文、基准及版本号保留准确名称。Meshy、Tripo、Hyper3D/Rodin、Zoo、Backflip、Blender、Rhino、Grasshopper、Shapr3D、Onshape、Autodesk Fusion 等不自造译名。
- 不把网格生成说成参数化 CAD；不把导出 STEP 说成恢复特征树；不把几何或渲染演示说成可编辑、可制造、可打印或可交付。原文没有说明的格式、约束、精度、拓扑、授权与兼容性不补写。
- 区分厂商声明、论文实验、第三方实测与作者推断；保留研究演示、内测、正式上线、开放代码、开放权重的不同阶段。
- 数字、币种、单位、版本、代码、命令和 URL 原样保留；价格、速度、面数、精度和成本必须带原文的测试条件或限制，不能跨不同任务直接横比。
