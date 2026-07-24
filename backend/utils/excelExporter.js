const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

/**
 * Generate an Excel workbook buffer for election results.
 * @param {object} election  - Election record
 * @param {Array}  results   - Array of { CandidateID, FullName, Party, Symbol, Manifesto, VoteCount }
 * @param {number} total     - Total votes cast
 * @returns {Buffer}
 */
const generateExcel = async (election, results, total) => {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'VoteSecure EVM (Live Sync Engine)';
  wb.created = new Date();

  const isLive = election.Status === 'Live';

  // ── Sheet 1: Results Summary
  const ws = wb.addWorksheet('Election Summary');

  // Header Banner
  ws.mergeCells('A1:H1');
  ws.getCell('A1').value = `ELECTION RESULTS ${isLive ? '⚡ LIVE REAL-TIME SYNC' : ''} — ${election.Title.toUpperCase()}`;
  ws.getCell('A1').font  = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
  ws.getCell('A1').fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: isLive ? 'FF0F766E' : 'FF0A2540' } };
  ws.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 38;

  ws.mergeCells('A2:H2');
  ws.getCell('A2').value = `Election Status: ${election.Status.toUpperCase()}  |  Total Live Votes Cast: ${total}  |  Last Excel Sync: ${new Date().toLocaleString()}`;
  ws.getCell('A2').font  = { italic: true, size: 10, color: { argb: 'FF64748B' } };
  ws.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(2).height = 22;

  ws.addRow([]);

  // Table Headers
  const headerRow = ws.addRow([
    'Rank',
    'Candidate ID',
    'Candidate Name',
    'Party',
    'Symbol',
    'Votes Received',
    'Vote Share (%)',
    'Current Standing'
  ]);

  headerRow.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isLive ? 'FF10B981' : 'FFFF9933' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'medium', color: { argb: 'FFE2E8F0' } }
    };
  });
  headerRow.height = 26;

  // Data Rows for Summary Sheet
  results.forEach((r, i) => {
    const pct = total > 0 ? ((r.VoteCount / total) * 100).toFixed(2) : '0.00';
    const isLeader = i === 0 && total > 0;
    const row = ws.addRow([
      i + 1,
      r.CandidateID || `CAND-${i + 1}`,
      r.FullName,
      r.Party,
      r.Symbol || '🗳️',
      r.VoteCount,
      `${pct}%`,
      isLeader ? (isLive ? '👑 CURRENT LEADER' : '🏆 WINNER') : `RANK #${i + 1}`
    ]);

    row.height = 24;

    if (isLeader) {
      row.eachCell(cell => {
        cell.font = { bold: true, color: { argb: 'FF854D0E' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF9C4' } };
      });
    }

    row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(3).alignment = { horizontal: 'left', vertical: 'middle' };
    row.getCell(4).alignment = { horizontal: 'left', vertical: 'middle' };
    row.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(6).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(7).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(8).alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // Column Widths
  ws.columns = [
    { width: 8  },   // Rank
    { width: 16 },   // Candidate ID
    { width: 30 },   // Name
    { width: 28 },   // Party
    { width: 12 },   // Symbol
    { width: 16 },   // Votes
    { width: 16 },   // Percentage
    { width: 20 },   // Status
  ];

  // ── Sheet 2+: Individual Worksheets for Each Candidate
  results.forEach((cand, idx) => {
    const safeName = (cand.FullName || `Candidate_${idx + 1}`).replace(/[\\/*?:[\]]/g, '').slice(0, 25);
    const candSheet = wb.addWorksheet(`Cand - ${safeName}`);

    // Banner
    candSheet.mergeCells('A1:D1');
    candSheet.getCell('A1').value = `CANDIDATE PROFILE & LIVE ELECTION STATS`;
    candSheet.getCell('A1').font  = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
    candSheet.getCell('A1').fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
    candSheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
    candSheet.getRow(1).height = 32;

    candSheet.addRow([]);

    const pct = total > 0 ? ((cand.VoteCount / total) * 100).toFixed(2) : '0.00';
    const isLeader = idx === 0 && total > 0;

    const infoTable = [
      ['Candidate ID', cand.CandidateID || `CAND-${idx + 1}`],
      ['Full Name', cand.FullName],
      ['Party Name', cand.Party],
      ['Party Symbol', cand.Symbol || '🗳️'],
      ['Manifesto / Bio', cand.Manifesto || 'N/A'],
      ['Election Name', election.Title],
      ['Live Votes Received', cand.VoteCount],
      ['Vote Share Percentage', `${pct}%`],
      ['Current Rank', `Rank #${idx + 1}`],
      ['Current Standing', isLeader ? (isLive ? '👑 CURRENT LEADER' : '🏆 WINNER') : `RANK #${idx + 1}`],
      ['Last Synchronized', new Date().toLocaleString()]
    ];

    infoTable.forEach(([label, val]) => {
      const row = candSheet.addRow([label, val]);
      row.height = 22;
      row.getCell(1).font = { bold: true, color: { argb: 'FF334155' } };
      row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
      row.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
      row.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' };
    });

    candSheet.columns = [
      { width: 24 },
      { width: 45 }
    ];
  });

  const protectOptions = {
    selectLockedCells: false,
    selectUnlockedCells: false,
    formatCells: false,
    formatColumns: false,
    formatRows: false,
    insertColumns: false,
    insertRows: false,
    insertHyperlinks: false,
    deleteColumns: false,
    deleteRows: false,
    sort: false,
    autoFilter: false,
    pivotTables: false
  };

  for (const sheet of wb.worksheets) {
    await sheet.protect('VoteSecureSecret2026', protectOptions);
    sheet.views = [
      {
        showGridLines: false,
        showRowColHeaders: false,
        showRuler: false
      }
    ];
  }

  return await wb.xlsx.writeBuffer();
};

/**
 * Asynchronously update the live Excel file stored on disk for an election.
 * Call this whenever a vote is cast to keep the excel file 100% updated in real-time.
 * @param {number|string} electionId
 */
const updateLiveExcelFile = async (electionId) => {
  try {
    const { Election, Candidate, CandidateVoteTotal, Vote } = require('../models');
    const election = await Election.findByPk(electionId);
    if (!election) return;

    const candidates = await Candidate.findAll({
      where: { ElectionID: electionId },
      include: [{ model: CandidateVoteTotal, attributes: ['VoteCount'] }],
      attributes: ['CandidateID', 'FullName', 'Party', 'Symbol', 'Manifesto'],
      order: [[CandidateVoteTotal, 'VoteCount', 'DESC']]
    });

    const results = candidates.map(c => {
      const raw = c.get({ plain: true });
      const voteCount = raw.CandidateVoteTotal ? raw.CandidateVoteTotal.VoteCount : 0;
      delete raw.CandidateVoteTotal;
      return { ...raw, VoteCount: voteCount };
    });

    const total = await Vote.count({ where: { ElectionID: electionId } });
    const buffer = await generateExcel(election, results, total);

    const uploadsDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, `live_results_election_${electionId}.xlsx`);
    fs.writeFileSync(filePath, buffer);
    console.log(`[LIVE EXCEL SYNC] Real-time updated Excel file for Election #${electionId} at ${filePath}`);
  } catch (err) {
    console.error('[LIVE EXCEL SYNC ERROR]', err);
  }
};

module.exports = { generateExcel, updateLiveExcelFile };
