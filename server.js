import express from 'express';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());

const DATA_FILE = join(__dirname, 'contracts.json');

// 确保数据文件存在
async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify([]));
  }
}

// 获取合同列表
app.get('/api/contracts', async (req, res) => {
  try {
    await ensureDataFile();
    const { page = 1, pageSize = 10 } = req.query;
    const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf8'));
    
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    res.json({
      data: data.slice(start, end),
      total: data.length
    });
  } catch (error) {
    res.status(500).json({ error: '获取数据失败' });
  }
});

// 添加合同
app.post('/api/contracts', async (req, res) => {
  try {
    await ensureDataFile();
    const contracts = JSON.parse(await fs.readFile(DATA_FILE, 'utf8'));
    
    // 生成新的ID（使用时间戳或找到最大ID + 1）
    const newId = contracts.length > 0 
      ? Math.max(...contracts.map(c => c.id)) + 1 
      : 1;
    
    // 添加ID到新合同数据中
    const newContract = {
      ...req.body,
      id: newId
    };
    
    contracts.push(newContract);
    await fs.writeFile(DATA_FILE, JSON.stringify(contracts, null, 2));
    res.json({ message: '添加成功', data: newContract });
  } catch (error) {
    res.status(500).json({ error: '添加失败' });
  }
});

// 删除合同
app.delete('/api/contracts', async (req, res) => {
  try {
    await ensureDataFile();
    const { contractNos } = req.body;
    
    if (!contractNos || !Array.isArray(contractNos) || contractNos.length === 0) {
      return res.status(400).json({ error: '无效的请求参数' });
    }

    // 读取现有数据
    const contracts = JSON.parse(await fs.readFile(DATA_FILE, 'utf8'));
    
    // 使用合同编号进行过滤
    const filteredContracts = contracts.filter(contract => 
      !contractNos.includes(contract.contractNo)
    );
    
    // 计算删除的数量
    const deletedCount = contracts.length - filteredContracts.length;

    if (deletedCount === 0) {
      return res.status(404).json({ error: '未找到要删除的合同' });
    }

    // 保存更新后的数据
    await fs.writeFile(DATA_FILE, JSON.stringify(filteredContracts, null, 2));

    res.json({ 
      success: true, 
      message: `成功删除 ${deletedCount} 条合同记录` 
    });
  } catch (error) {
    console.error('删除合同失败:', error);
    res.status(500).json({ error: '删除合同失败' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 