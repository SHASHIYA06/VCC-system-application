#!/usr/bin/env node

/**
 * Bundle Size Analysis Script
 * Analyzes Next.js bundle and identifies optimization opportunities
 */

const fs = require('fs');
const path = require('path');

// Heavy dependencies that should be lazy-loaded
const HEAVY_DEPENDENCIES = [
  'langchain',
  '@langchain/community',
  '@langchain/core',
  '@langchain/openai',
  '@anthropic-ai/sdk',
  'playwright',
  'puppeteer',
  'mongodb',
  'pdfjs-dist',
  'pdf-lib',
  'react-pdf',
  'sharp',
  'canvas',
  'openai'
];

// Routes that should use lightweight implementations
const LIGHTWEIGHT_ROUTES = [
  'src/app/api/voice/',
  'src/app/api/ai-lite/',
  'src/app/api/search/',
  'src/app/api/health/'
];

function analyzePackageJson() {
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  console.log('📦 VCC System Bundle Analysis');
  console.log('═'.repeat(50));
  
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  const heavyDeps = Object.keys(deps).filter(dep => 
    HEAVY_DEPENDENCIES.some(heavy => dep.includes(heavy))
  );
  
  console.log(`\n🎯 Heavy Dependencies Found: ${heavyDeps.length}`);
  heavyDeps.forEach(dep => {
    console.log(`  • ${dep}: ${deps[dep]}`);
  });
  
  return { packageJson, heavyDeps };
}

function analyzeRoutes() {
  console.log('\n🔍 API Route Analysis');
  console.log('─'.repeat(30));
  
  const apiDir = path.join(process.cwd(), 'src/app/api');
  if (!fs.existsSync(apiDir)) {
    console.log('  ❌ API directory not found');
    return;
  }
  
  const routes = fs.readdirSync(apiDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  console.log(`  📁 Total API routes: ${routes.length}`);
  
  // Check for heavy imports in routes
  const heavyRoutes = [];
  routes.forEach(route => {
    const routePath = path.join(apiDir, route, 'route.ts');
    if (fs.existsSync(routePath)) {
      const content = fs.readFileSync(routePath, 'utf8');
      
      const hasHeavyImports = HEAVY_DEPENDENCIES.some(dep => 
        content.includes(`from '${dep}'`) || 
        content.includes(`from "@${dep}"`) ||
        content.includes(`import ${dep}`) ||
        content.includes(`import('${dep}')`) ||
        content.includes(`import("${dep}")`)
      );
      
      if (hasHeavyImports) {
        heavyRoutes.push(route);
      }
    }
  });
  
  console.log(`  ⚠️  Routes with heavy imports: ${heavyRoutes.length}`);
  heavyRoutes.forEach(route => console.log(`    • ${route}`));
  
  return { routes, heavyRoutes };
}

function generateOptimizationPlan(analysis) {
  console.log('\n🚀 Optimization Recommendations');
  console.log('═'.repeat(50));
  
  const recommendations = [];
  
  // Bundle splitting recommendations
  if (analysis.heavyDeps.length > 0) {
    recommendations.push({
      type: 'Bundle Splitting',
      priority: 'HIGH',
      action: 'Move heavy dependencies to dynamic imports',
      dependencies: analysis.heavyDeps.slice(0, 5)
    });
  }
  
  // Route optimization
  if (analysis.heavyRoutes.length > 0) {
    recommendations.push({
      type: 'API Route Optimization', 
      priority: 'HIGH',
      action: 'Implement lazy loading in heavy API routes',
      routes: analysis.heavyRoutes.slice(0, 3)
    });
  }
  
  // Runtime configuration
  recommendations.push({
    type: 'Runtime Configuration',
    priority: 'MEDIUM', 
    action: 'Add runtime exports to lightweight routes',
    details: 'Use Edge Runtime where possible'
  });
  
  // Display recommendations
  recommendations.forEach((rec, index) => {
    console.log(`\n${index + 1}. ${rec.type} [${rec.priority}]`);
    console.log(`   ${rec.action}`);
    if (rec.dependencies) {
      console.log(`   Dependencies: ${rec.dependencies.join(', ')}`);
    }
    if (rec.routes) {
      console.log(`   Routes: ${rec.routes.join(', ')}`);
    }
    if (rec.details) {
      console.log(`   Details: ${rec.details}`);
    }
  });
  
  return recommendations;
}

function generateNextConfigSuggestions() {
  console.log('\n⚙️  Next.js Configuration Suggestions');
  console.log('─'.repeat(40));
  
  const suggestions = [
    'experimental.serverComponentsExternalPackages: Move heavy packages external',
    'experimental.optimizePackageImports: Enable for UI libraries', 
    'webpack.optimization.splitChunks: Aggressive chunk splitting (<200KB)',
    'webpack.externals: Mark server-only packages as external',
    'output: "standalone" - Already configured ✅',
    'productionBrowserSourceMaps: false - Already configured ✅'
  ];
  
  suggestions.forEach((suggestion, index) => {
    const isConfigured = suggestion.includes('✅');
    const prefix = isConfigured ? '✅' : '⚡';
    console.log(`  ${prefix} ${suggestion.replace(' - Already configured ✅', '')}`);
  });
}

function main() {
  console.clear();
  
  try {
    const packageAnalysis = analyzePackageJson();
    const routeAnalysis = analyzeRoutes();
    
    const analysis = {
      ...packageAnalysis,
      ...routeAnalysis
    };
    
    generateOptimizationPlan(analysis);
    generateNextConfigSuggestions();
    
    console.log('\n🎯 Bundle Size Target for Vercel');
    console.log('─'.repeat(40));
    console.log('  📦 Serverless Function Limit: 250MB');
    console.log('  🎯 Target per function: <50MB');
    console.log('  ⚡ Chunk size target: <200KB');
    console.log('  🏃 Edge Runtime target: <1MB');
    
    console.log('\n💡 Quick Wins');
    console.log('─'.repeat(20));
    console.log('  1. Add runtime exports to all API routes');
    console.log('  2. Replace direct imports with dynamic imports');
    console.log('  3. Use lightweight alternatives for simple operations');
    console.log('  4. Enable experimental Next.js optimizations');
    console.log('  5. Test build with VERCEL_ANALYZE_BUILD_OUTPUT=1');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { analyzePackageJson, analyzeRoutes, generateOptimizationPlan };