import { spawn } from 'child_process';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// YOLOv5 Configuration
const YOLO_BASE_PATH = process.env.YOLO_BASE_PATH || 'C:\\Users\\iniya\\yolov5';
const YOLO_MODEL_PATH = process.env.YOLO_MODEL_PATH || path.join(YOLO_BASE_PATH, 'runs', 'train-cls', 'exp3', 'weights', 'best.pt');
const YOLO_PREDICT_SCRIPT = path.join(YOLO_BASE_PATH, 'classify', 'predict.py');
const PYTHON_PATH = process.env.PYTHON_PATH || 'python';

// Grade mapping
const GRADE_QUALITY_MAP = {
  'Grade_A': { grade: 'A', baseScore: 90, freshness: 'Excellent' },
  'Grade_B': { grade: 'B', baseScore: 75, freshness: 'Good' },
  'Grade_C': { grade: 'C', baseScore: 50, freshness: 'Fair' }
};

export const analyzeCropImage = async (imagePath) => {
  try {
    console.log('🔍 Starting YOLOv5 Classification analysis...');
    console.log('📂 Model path:', YOLO_MODEL_PATH);
    console.log('📸 Image path:', imagePath);

    // Convert to absolute path if relative
    const absoluteImagePath = path.isAbsolute(imagePath) 
      ? imagePath 
      : path.resolve(process.cwd(), imagePath);
    
    console.log('📸 Absolute path:', absoluteImagePath);

    // Check if model exists, gracefully fallback if not
    if (!fs.existsSync(YOLO_MODEL_PATH)) {
      console.warn('⚠️  YOLOv5 model not found:', YOLO_MODEL_PATH);
      console.warn('⚠️  Using fallback grading system');
      return createFallbackGrade('Model not configured');
    }

    // Check if image exists
    if (!fs.existsSync(absoluteImagePath)) {
      console.error('❌ Image not found:', absoluteImagePath);
      return createFallbackGrade('Image not found');
    }

    const result = await runYOLOClassification(absoluteImagePath);
    console.log('✅ YOLOv5 analysis complete:', result.grade);
    return result;

  } catch (error) {
    console.error('❌ YOLOv5 Analysis Error:', error.message);
    console.warn('⚠️  Falling back to default grading');
    return createFallbackGrade(error.message);
  }
};

async function runYOLOClassification(imagePath) {
  return new Promise((resolve) => {
    // Parse PYTHON_PATH in case it has arguments (e.g., "py -3.10")
    const pythonParts = PYTHON_PATH.split(' ');
    const pythonCmd = pythonParts[0];
    const pythonArgs = pythonParts.slice(1);
    
    const args = [
      ...pythonArgs,
      YOLO_PREDICT_SCRIPT,
      '--weights', YOLO_MODEL_PATH,
      '--source', imagePath,
      '--imgsz', '224',
      '--nosave'
    ];

    console.log('🚀 Running YOLOv5:', PYTHON_PATH);
    console.log('📍 Command:', pythonCmd);
    console.log('📝 Args:', args);
    console.log('📂 Working Dir:', YOLO_BASE_PATH);

    const pythonProcess = spawn(pythonCmd, args, {
      cwd: YOLO_BASE_PATH,
      env: process.env,
      shell: true,
      maxBuffer: 1024 * 1024 * 10  // 10MB buffer
    });

    let outputData = '';
    let errorData = '';
    const outputChunks = [];
    const errorChunks = [];

    // Collect raw buffers to avoid encoding issues
    pythonProcess.stdout.on('data', (data) => {
      outputChunks.push(data);
    });

    pythonProcess.stderr.on('data', (data) => {
      errorChunks.push(data);
    });

    pythonProcess.on('close', (code) => {
      // Give a delay to ensure all data is received
      setTimeout(() => {
        // Combine all chunks and convert to string
        outputData = Buffer.concat(outputChunks).toString('utf8');
        errorData = Buffer.concat(errorChunks).toString('utf8');
        
        // YOLOv5 outputs to stderr, so combine them
        const fullOutput = outputData + errorData;
        
        console.log('🏁 Process closed with code:', code);
        console.log('📤 Output length:', fullOutput.length, 'bytes');
        console.log('📤 Full output:', fullOutput);
        
        if (code !== 0 && !fullOutput.includes('Grade_')) {
          console.error('❌ YOLOv5 process failed:', code);
          resolve(createFallbackGrade('Process failed'));
          return;
        }

        try {
          const result = parseYOLOOutput(fullOutput);
          resolve(result);
        } catch (parseError) {
          console.error('❌ Parse error:', parseError.message);
          console.error('Full output for debugging:', fullOutput);
          
          // Try to extract any grade information from output
          const fallbackResult = extractFallbackGrade(fullOutput);
          resolve(fallbackResult);
        }
      }, 200); // 200ms delay to ensure buffer is flushed
    });

    pythonProcess.on('error', (error) => {
      console.error('❌ Failed to start YOLOv5:', error);
      resolve(createFallbackGrade(error.message));
    });
  });
}

function parseYOLOOutput(output) {
  // Try multiple regex patterns to match YOLOv5 output
  const patterns = [
    /Grade_A\s+([\d.]+),\s+Grade_B\s+([\d.]+),\s+Grade_C\s+([\d.]+)/,
    /Grade_A\s+([\d.]+)\s+Grade_B\s+([\d.]+)\s+Grade_C\s+([\d.]+)/,
    /Grade_A:\s*([\d.]+).*?Grade_B:\s*([\d.]+).*?Grade_C:\s*([\d.]+)/,
    /A\s+([\d.]+),?\s+B\s+([\d.]+),?\s+C\s+([\d.]+)/i
  ];

  let match = null;
  for (const pattern of patterns) {
    match = output.match(pattern);
    if (match) break;
  }

  if (!match) {
    console.warn('⚠️ Could not parse grades from output');
    // Check if output contains class names to make educated guess
    if (output.toLowerCase().includes('grade_c') || output.toLowerCase().includes('grade c')) {
      return createSmartFallback('C', output);
    } else if (output.toLowerCase().includes('grade_b') || output.toLowerCase().includes('grade b')) {
      return createSmartFallback('B', output);
    } else if (output.toLowerCase().includes('grade_a') || output.toLowerCase().includes('grade a')) {
      return createSmartFallback('A', output);
    }
    throw new Error('No grades detected in output');
  }

  const probA = parseFloat(match[1]);
  const probB = parseFloat(match[2]);
  const probC = parseFloat(match[3]);

  let detectedGrade;
  let confidence;

  if (probA >= probB && probA >= probC) {
    detectedGrade = 'Grade_A';
    confidence = probA;
  } else if (probB >= probA && probB >= probC) {
    detectedGrade = 'Grade_B';
    confidence = probB;
  } else {
    detectedGrade = 'Grade_C';
    confidence = probC;
  }

  const confidencePercent = Math.round(confidence * 100);
  const gradeInfo = GRADE_QUALITY_MAP[detectedGrade] || GRADE_QUALITY_MAP['Grade_B'];

  let qualityScore = gradeInfo.baseScore;
  if (confidencePercent > 80) {
    qualityScore = Math.min(100, gradeInfo.baseScore + 5);
  } else if (confidencePercent < 60) {
    qualityScore = Math.max(0, gradeInfo.baseScore - 10);
  }

  const defects = [];
  if (gradeInfo.grade === 'C') {
    defects.push('Quality concerns detected');
    if (probC > 0.7) {
      defects.push('Significant defects visible');
    }
  } else if (gradeInfo.grade === 'B' && probB < 0.7) {
    defects.push('Minor quality variations detected');
  }

  const analysis = `Classified as ${detectedGrade} with ${confidencePercent}% confidence. ` +
    `Distribution: A=${(probA * 100).toFixed(1)}%, B=${(probB * 100).toFixed(1)}%, C=${(probC * 100).toFixed(1)}%.`;

  return {
    grade: gradeInfo.grade,
    confidence: confidencePercent,
    qualityScore: qualityScore,
    defects: defects,
    freshness: gradeInfo.freshness,
    analysis: analysis,
    modelPrediction: {
      Grade_A: probA,
      Grade_B: probB,
      Grade_C: probC
    },
    analyzedAt: new Date()
  };
}

function createFallbackGrade(reason = 'Analysis unavailable') {
  return {
    grade: 'B',
    confidence: 60,
    qualityScore: 70,
    defects: [`YOLOv5: ${reason}`],
    freshness: 'Good',
    analysis: 'Automated grading temporarily unavailable. Manual inspection recommended.',
    analyzedAt: new Date()
  };
}

function createSmartFallback(suggestedGrade, output) {
  // Create a conservative grade based on detected class name
  const gradeMap = {
    'A': { grade: 'A', confidence: 75, qualityScore: 90, freshness: 'Excellent' },
    'B': { grade: 'B', confidence: 70, qualityScore: 75, freshness: 'Good' },
    'C': { grade: 'C', confidence: 65, qualityScore: 55, freshness: 'Fair' }
  };

  const gradeInfo = gradeMap[suggestedGrade] || gradeMap['B'];
  
  return {
    grade: gradeInfo.grade,
    confidence: gradeInfo.confidence,
    qualityScore: gradeInfo.qualityScore,
    defects: gradeInfo.grade === 'C' ? ['Quality concerns detected'] : [],
    freshness: gradeInfo.freshness,
    analysis: `Classified as Grade_${suggestedGrade} based on model output. Conservative estimate used.`,
    analyzedAt: new Date()
  };
}

function extractFallbackGrade(output) {
  // Try to extract any useful information from the output
  console.log('🔄 Attempting fallback grade extraction...');
  
  // Look for any mention of grades in various formats
  const lowerOutput = output.toLowerCase();
  
  if (lowerOutput.includes('grade_c') || lowerOutput.includes('grade c')) {
    console.log('📌 Detected Grade C mention');
    return createSmartFallback('C', output);
  } else if (lowerOutput.includes('grade_b') || lowerOutput.includes('grade b')) {
    console.log('📌 Detected Grade B mention');
    return createSmartFallback('B', output);
  } else if (lowerOutput.includes('grade_a') || lowerOutput.includes('grade a')) {
    console.log('📌 Detected Grade A mention');
    return createSmartFallback('A', output);
  }
  
  // If model loaded successfully, assume it's at least Grade B
  if (lowerOutput.includes('model summary') || lowerOutput.includes('fusing layers')) {
    console.log('📌 Model loaded successfully, defaulting to Grade B');
    return {
      grade: 'B',
      confidence: 65,
      qualityScore: 75,
      defects: [],
      freshness: 'Good',
      analysis: 'Model analysis completed. Grade B assigned as conservative estimate.',
      analyzedAt: new Date()
    };
  }
  
  // Last resort: return Grade B
  console.log('📌 Using default Grade B fallback');
  return createFallbackGrade('Analysis completed with default grade');
}

export default { analyzeCropImage };
