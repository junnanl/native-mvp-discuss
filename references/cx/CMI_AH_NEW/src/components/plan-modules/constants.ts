export const taxRates = ['6%', '9%', '13%']
export const contractStages = ['开工', '进场', '到货', '初验', '终验']
export const yesNoOptions = ['是', '否']
export const reimburseMethodOptions = ['一次性', '月', '阶段']

export const itTariffTaxMap: Record<string, string> = {
  '[1372]业务集成费': '6%',
  '[849]ICT维保服务费': '6%',
  '[1205]系统集成服务': '9%',
  '[956]软件开发服务': '13%'
}

export const ctTariffTaxMap: Record<string, string> = {
  '[1372]宽带费': '6%',
  '[849]融合通信费': '6%',
  '[1205]专线费': '9%',
  '[956]云服务费用': '6%'
}

export const itTariffMgmtNameMap: Record<string, string> = {
  '[1372]业务集成费': '业务集成服务',
  '[849]ICT维保服务费': 'ICT维保服务',
  '[1205]系统集成服务': '系统集成服务',
  '[956]软件开发服务': '软件开发服务'
}

export const itTariffCoaMap: Record<string, string> = {
  '[1372]业务集成费': 'C-1372-01',
  '[849]ICT维保服务费': 'C-849-01',
  '[1205]系统集成服务': 'C-1205-01',
  '[956]软件开发服务': 'C-956-01'
}

export const itTariffThirdSubjectMap: Record<string, string> = {
  '[1372]业务集成费': 'S1372',
  '[849]ICT维保服务费': 'S849',
  '[1205]系统集成服务': 'S1205',
  '[956]软件开发服务': 'S956'
}

export const ctTariffMgmtNameMap: Record<string, string> = {
  '[1372]宽带费': '宽带服务',
  '[849]融合通信费': '融合通信服务',
  '[1205]专线费': '专线服务',
  '[956]云服务费用': '云服务'
}

export const ctTariffCoaMap: Record<string, string> = {
  '[1372]宽带费': 'C-1372-02',
  '[849]融合通信费': 'C-849-02',
  '[1205]专线费': 'C-1205-02',
  '[956]云服务费用': 'C-956-02'
}

export const ctTariffCoaNameMap: Record<string, string> = {
  '[1372]宽带费': '宽带接入服务收入',
  '[849]融合通信费': '融合通信服务收入',
  '[1205]专线费': '专线接入服务收入',
  '[956]云服务费用': '云服务收入'
}

export const ctTariffThirdSubjectMap: Record<string, string> = {
  '[1372]宽带费': 'S1372',
  '[849]融合通信费': 'S849',
  '[1205]专线费': 'S1205',
  '[956]云服务费用': 'S956'
}

export const businessSubjectMap: Record<string, string> = {
  '集成收入-信息服务': '信息服务费',
  '集成收入-安装服务': '安装服务费',
  '维保收入-信息服务': '信息服务费',
  '维保收入-安装服务': '安装服务费',
  '维保收入-设备及其他硬件维修服务': '设备维护费',
  '商品销售收入': '商品销售收入',
  'ICT设备/终端租赁收入': '租赁收入',
  'ICT设备/终端转租收入': '转租收入',
  '工程建设与服务收入': '工程建设收入',
  '集成费-信息服务': '信息服务费',
  '集成费-安装服务': '安装服务费',
  '维保费-信息服务': '信息服务费',
  '维保费-安装服务': '安装服务费',
  '维保费-设备及其他硬件维修服务': '设备维护费',
  '商品销售成本': '商品销售成本',
  'ICT设备/终端租赁成本': '租赁成本',
  'ICT设备/终端转租成本': '转租成本',
  '业务技术支撑成本': '技术支撑成本',
  '网络设备成本': '设备成本',
  '网络终端成本': '终端成本',
  '网络施工成本': '施工成本',
  '网络维护成本': '维护成本',
  '硬件设备类投资': '硬件设备投资',
  '定制软件类投资': '软件投资',
  '集成服务费-信息服务': '信息服务投资',
  '集成服务费-安装': '安装服务投资',
  '工程配套费': '工程配套费',
  '建安费用': '建安费用',
  '施工费用': '施工费用',
  '设计监理': '设计监理费',
  '配套费用': '配套费用',
  代理人佣金: '代理人佣金',
  'IT成本分摊': 'IT成本分摊',
  'CT成本分摊': 'CT成本分摊'
}

export function getBusinessSubject(content: string) {
  return businessSubjectMap[content] || '-'
}

export const itProductOptions = [
  '集成收入-信息服务',
  '集成收入-安装服务',
  '维保收入-信息服务',
  '维保收入-安装服务',
  '维保收入-设备及其他硬件维修服务',
  '商品销售收入',
  'ICT设备/终端租赁收入',
  'ICT设备/终端转租收入',
  '工程建设与服务收入'
]

export const itTariffOptions = [
  '[1372]业务集成费',
  '[849]ICT维保服务费',
  '[1205]系统集成服务',
  '[956]软件开发服务'
]

export const ctProductOptions = [
  '语音',
  '数据专线',
  'IMS固话',
  '语音专线',
  '短信',
  '数据流量',
  '企业宽带',
  '互联网专线',
  '云计算',
  '大数据',
  'IDC',
  '5G专网',
  '物联网',
  '和教育'
]

// 产品类型 -> 产品名称列表（格式：【产品编码】产品名称）
export const ctProductTypeProductNameMap: Record<string, string[]> = {
  '语音': ['【CT-V001】语音基础服务', '【CT-V002】语音增值服务'],
  '数据专线': ['【CT-D001】数据专线标准版', '【CT-D002】数据专线尊享版'],
  'IMS固话': ['【CT-I001】IMS固话基础版', '【CT-I002】IMS固话企业版'],
  '语音专线': ['【CT-VP001】语音专线标准版', '【CT-VP002】语音专线高可用版'],
  '短信': ['【CT-S001】企业短信标准版'],
  '数据流量': ['【CT-F001】企业流量包', '【CT-F002】定向流量包'],
  '企业宽带': ['【CT-B001】企业宽带100M', '【CT-B002】企业宽带500M', '【CT-B003】企业宽带1000M'],
  '互联网专线': ['【CT-INT001】互联网专线标准版', '【CT-INT002】互联网专线高可用版'],
  '云计算': ['【CT-C001】云主机基础型', '【CT-C002】云存储标准型', '【CT-C003】云数据库MySQL'],
  '大数据': ['【CT-BD001】大数据平台标准版', '【CT-BD002】数据可视化服务'],
  'IDC': ['【CT-ID001】IDC托管服务器', '【CT-ID002】IDC机柜租赁'],
  '5G专网': ['【CT-5G001】5G专网基础版', '【CT-5G002】5G专网增强版'],
  '物联网': ['【CT-IOT001】物联网连接服务', '【CT-IOT002】物联网平台服务'],
  '和教育': ['【CT-ED001】智慧校园标准版', '【CT-ED002】在线课堂服务']
}

// 产品名称 -> 资费列表（选择产品名称后，资费按此过滤）
export const ctProductNameTariffMap: Record<string, string[]> = {
  '【CT-V001】语音基础服务': ['[1372]宽带费', '[849]融合通信费'],
  '【CT-V002】语音增值服务': ['[849]融合通信费'],
  '【CT-D001】数据专线标准版': ['[1205]专线费'],
  '【CT-D002】数据专线尊享版': ['[1205]专线费'],
  '【CT-I001】IMS固话基础版': ['[849]融合通信费'],
  '【CT-I002】IMS固话企业版': ['[849]融合通信费'],
  '【CT-VP001】语音专线标准版': ['[1205]专线费'],
  '【CT-VP002】语音专线高可用版': ['[1205]专线费'],
  '【CT-S001】企业短信标准版': ['[849]融合通信费'],
  '【CT-F001】企业流量包': ['[956]云服务费用'],
  '【CT-F002】定向流量包': ['[956]云服务费用'],
  '【CT-B001】企业宽带100M': ['[1372]宽带费'],
  '【CT-B002】企业宽带500M': ['[1372]宽带费'],
  '【CT-B003】企业宽带1000M': ['[1372]宽带费'],
  '【CT-INT001】互联网专线标准版': ['[1205]专线费'],
  '【CT-INT002】互联网专线高可用版': ['[1205]专线费'],
  '【CT-C001】云主机基础型': ['[956]云服务费用'],
  '【CT-C002】云存储标准型': ['[956]云服务费用'],
  '【CT-C003】云数据库MySQL': ['[956]云服务费用'],
  '【CT-BD001】大数据平台标准版': ['[956]云服务费用'],
  '【CT-BD002】数据可视化服务': ['[956]云服务费用'],
  '【CT-ID001】IDC托管服务器': ['[956]云服务费用'],
  '【CT-ID002】IDC机柜租赁': ['[956]云服务费用'],
  '【CT-5G001】5G专网基础版': ['[956]云服务费用', '[1205]专线费'],
  '【CT-5G002】5G专网增强版': ['[956]云服务费用', '[1205]专线费'],
  '【CT-IOT001】物联网连接服务': ['[956]云服务费用'],
  '【CT-IOT002】物联网平台服务': ['[956]云服务费用'],
  '【CT-ED001】智慧校园标准版': ['[849]融合通信费'],
  '【CT-ED002】在线课堂服务': ['[849]融合通信费']
}

// 解析产品名称字符串 -> { code, name }
export function parseCtProductName(productDisplay: string): { code: string; name: string } {
  if (!productDisplay) return { code: '', name: '' }
  const match = productDisplay.match(/^【([^】]+)】(.+)$/)
  if (match) return { code: match[1], name: match[2] }
  return { code: '', name: productDisplay }
}

// 判断产品类型是否含专线（控制带宽字段是否显示）
export function isCtBandwidthRequired(productType: string): boolean {
  if (!productType) return false
  return productType.includes('专线') || productType.includes('宽带')
}

export const ctTariffOptions = [
  '[1372]宽带费',
  '[849]融合通信费',
  '[1205]专线费',
  '[956]云服务费用'
]

// 兼容保留：产品类型 -> 资费映射（回显/兼容旧数据用）
export const ctProductTariffMap: Record<string, string[]> = {
  '语音': ['[1372]宽带费'],
  '数据专线': ['[1205]专线费'],
  'IMS固话': ['[849]融合通信费'],
  '语音专线': ['[1205]专线费'],
  '短信': ['[849]融合通信费'],
  '数据流量': ['[956]云服务费用'],
  '企业宽带': ['[1372]宽带费'],
  '互联网专线': ['[1205]专线费'],
  '云计算': ['[956]云服务费用'],
  '大数据': ['[956]云服务费用'],
  'IDC': ['[956]云服务费用'],
  '5G专网': ['[956]云服务费用'],
  '物联网': ['[956]云服务费用'],
  '和教育': ['[849]融合通信费']
}

export const ctPackageOptions = [
  '基础套餐',
  '标准套餐',
  '高级套餐',
  '企业套餐',
  '定制套餐'
]

export const expenseContentITOptions = [
  '集成费-信息服务',
  '集成费-安装服务',
  '维保费-信息服务',
  '维保费-安装服务',
  '维保费-设备及其他硬件维修服务',
  '商品销售成本',
  'ICT设备/终端租赁成本',
  'ICT设备/终端转租成本'
]

export const expenseContentCTOptions = [
  '业务技术支撑成本',
  '网络设备成本',
  '网络终端成本',
  '网络施工成本',
  '网络维护成本'
]

export const expenseContentAgentOptions = [
  '集成费-信息服务',
  '集成费-安装服务',
  '维保费-信息服务',
  '维保费-安装服务',
  '维保费-设备及其他硬件维修服务',
  '商品销售成本',
  'ICT设备/终端租赁成本',
  'ICT设备/终端转租成本'
]

export const investmentContentITOptions = [
  '硬件设备类投资',
  '定制软件类投资',
  '集成服务费-信息服务',
  '集成服务费-安装',
  '工程配套费',
  '建安费用'
]

export const investmentContentCTOptions = [
  '硬件设备类投资',
  '定制软件类投资',
  '施工费用',
  '设计监理',
  '配套费用'
]

export const budgetTypeOptions = ['预算内', '预算外', '专项预算', '资本支出']

export const investmentTypeOptions = ['固定资产', '无形资产', '长期投资', '在建工程']

export const allocationTypeOptions = ['管理费用分摊', '销售费用分摊', '研发费用分摊', '其他分摊']

export const allocationContentOptions = [
  'IT成本分摊',
  'CT成本分摊'
]

export const allocationMethodOptions = ['一次性', '月']
