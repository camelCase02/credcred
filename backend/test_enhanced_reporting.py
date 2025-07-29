#!/usr/bin/env python3
"""
Test script to demonstrate enhanced report generation capabilities.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.report_service import ReportService
from services.credentialing_service import CredentialingService
from services.provider_service import ProviderService
from utils.logger import audit_logger


def test_enhanced_report_generation():
    """Test the enhanced report generation with comprehensive data analysis"""
    
    print("🚀 Testing Enhanced Report Generation")
    print("=" * 50)
    
    # Initialize services
    report_service = ReportService()
    credentialing_service = CredentialingService()
    provider_service = ProviderService()
    
    try:
        # Get available providers
        providers = provider_service.get_all_providers()
        if not providers:
            print("❌ No providers found. Please ensure provider data is available.")
            return
        
        print(f"📋 Found {len(providers)} providers")
        
        # Test with first provider
        test_provider = providers[0]
        provider_id = test_provider.PersonalInfo.provider_id
        
        print(f"🔍 Testing with provider: {test_provider.PersonalInfo.name} (ID: {provider_id})")
        
        # Run credentialing process to generate comprehensive data
        print("⚙️  Running credentialing process...")
        result = credentialing_service.credential_provider(provider_id)
        
        print(f"✅ Credentialing completed:")
        print(f"   - Compliance Status: {result.compliance_status.value}")
        print(f"   - Overall Score: {result.score}/5")
        print(f"   - Processing Time: {result.processing_time:.2f} seconds")
        
        # Get the session ID from the result
        session_id = f"{provider_id}_{result.processing_time}"
        
        # Generate comprehensive report
        print("📊 Generating comprehensive report...")
        report = report_service.generate_credentialing_report(provider_id, session_id)
        
        print(f"✅ Report generated successfully:")
        print(f"   - Report File: {report['report_file']}")
        print(f"   - JSON Summary: {report['json_summary']}")
        print(f"   - Report ID: {report['report_id']}")
        
        # Test batch report generation if multiple providers exist
        if len(providers) > 1:
            print("\n📦 Testing batch report generation...")
            provider_ids = [p.PersonalInfo.provider_id for p in providers[:3]]  # Test with first 3 providers
            
            batch_report = report_service.generate_batch_reports(provider_ids)
            
            print(f"✅ Batch report generated:")
            print(f"   - Batch ID: {batch_report['batch_id']}")
            print(f"   - Successful: {batch_report['summary']['successful_count']}")
            print(f"   - Failed: {batch_report['summary']['failed_count']}")
            print(f"   - Success Rate: {batch_report['summary']['success_rate']:.1%}")
            print(f"   - Batch File: {batch_report['batch_file']}")
        
        # Test summary report generation
        print("\n📈 Testing summary report generation...")
        summary_report = report_service.generate_summary_report()
        
        print(f"✅ Summary report generated:")
        print(f"   - Summary Report: {summary_report['summary_report_file']}")
        print(f"   - Summary Data: {summary_report['summary_data_file']}")
        print(f"   - Providers Analyzed: {summary_report['providers_analyzed']}")
        print(f"   - Total Sessions: {summary_report['total_credentialing_sessions']}")
        
        print("\n🎉 Enhanced report generation test completed successfully!")
        print("\n📁 Generated files:")
        print(f"   - Individual Report: {report['report_file']}")
        print(f"   - JSON Summary: {report['json_summary']}")
        if len(providers) > 1:
            print(f"   - Batch Report: {batch_report['batch_file']}")
        print(f"   - Summary Report: {summary_report['summary_report_file']}")
        print(f"   - Summary Data: {summary_report['summary_data_file']}")
        
    except Exception as e:
        print(f"❌ Error during testing: {str(e)}")
        import traceback
        traceback.print_exc()


def test_report_content_analysis():
    """Test the content analysis capabilities of the enhanced reports"""
    
    print("\n🔍 Testing Report Content Analysis")
    print("=" * 50)
    
    report_service = ReportService()
    
    try:
        # Get credentialing history to analyze
        history = audit_logger.get_credentialing_history()
        
        if not history:
            print("❌ No credentialing history found. Run credentialing first.")
            return
        
        print(f"📊 Analyzing {len(history)} credentialing sessions...")
        
        # Analyze the data
        summary_data = report_service._analyze_credentialing_summary(history)
        
        print("✅ Analysis completed:")
        print(f"   - Total Providers: {summary_data['metadata']['total_providers']}")
        print(f"   - Total Sessions: {summary_data['metadata']['total_sessions']}")
        print(f"   - Compliance Rate: {summary_data['compliance_analysis']['compliance_rate']:.1%}")
        print(f"   - Average Score: {summary_data['score_analysis']['average_score']:.2f}/5")
        print(f"   - Average Processing Time: {summary_data['performance_analysis']['average_processing_time']:.2f} seconds")
        
        # Test risk analysis
        print("\n⚠️  Risk Analysis:")
        risk_indicators = summary_data['risk_analysis']
        for risk_type, count in risk_indicators.items():
            if count > 0:
                print(f"   - {risk_type.replace('_', ' ').title()}: {count}")
        
        print("\n✅ Content analysis test completed successfully!")
        
    except Exception as e:
        print(f"❌ Error during content analysis: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    print("🧪 Enhanced Report Generation Test Suite")
    print("=" * 60)
    
    # Test enhanced report generation
    test_enhanced_report_generation()
    
    # Test content analysis
    test_report_content_analysis()
    
    print("\n🎯 Test suite completed!")
    print("\n💡 Key Improvements:")
    print("   - Comprehensive data gathering from all logged sources")
    print("   - LLM-powered analysis of all credentialing data")
    print("   - Detailed risk assessment and recommendations")
    print("   - Process transparency with AI reasoning")
    print("   - Batch reporting for multiple providers")
    print("   - Summary reports with statistical analysis")
    print("   - JSON summaries for programmatic access")
    print("   - Enhanced fallback templates with detailed analysis") 