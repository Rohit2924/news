import { NextRequest, NextResponse } from 'next/server';
import { testConnection, query } from '@/lib/models/db';

// GET /api/test-db - Test database connection
export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const connectionTest = await testConnection();
    
    if (!connectionTest.success) {
      return NextResponse.json({
        success: false,
        message: 'Database connection failed',
        error: connectionTest.details
      }, { status: 500 });
    }

    // Test a simple query
    const simpleQuery = await query('SELECT 1 + 1 as result');
    
    // Check if we can create a test table (and clean it up)
    try {
      await query('CREATE TABLE IF NOT EXISTS connection_test (id SERIAL PRIMARY KEY, test_value TEXT)');
      await query('INSERT INTO connection_test (test_value) VALUES ($1)', ['Connection test successful']);
      const testResult = await query('SELECT * FROM connection_test WHERE test_value = $1', ['Connection test successful']);
      await query('DELETE FROM connection_test WHERE test_value = $1', ['Connection test successful']);
      
      return NextResponse.json({
        success: true,
        message: 'Database connection and operations successful!',
        details: {
          connection_info: connectionTest.details,
          simple_query_result: simpleQuery.rows[0],
          crud_test_result: {
            records_found: testResult.rows.length,
            sample_record: testResult.rows[0]
          }
        }
      });
    } catch (tableError) {
      console.error('Table operations failed:', tableError);
      return NextResponse.json({
        success: true,
        message: 'Basic connection successful, but table operations failed',
        warning: 'You might not have CREATE/INSERT/DELETE permissions',
        details: {
          connection_info: connectionTest.details,
          simple_query_result: simpleQuery.rows[0],
          table_error: tableError instanceof Error ? tableError.message : 'Unknown table error'
        }
      });
    }
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Database test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/test-db - Test database with custom query
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query: testQuery, params } = body;

    if (!testQuery) {
      return NextResponse.json({
        success: false,
        message: 'Query is required'
      }, { status: 400 });
    }

    // Only allow SELECT queries for safety
    if (!testQuery.trim().toLowerCase().startsWith('select')) {
      return NextResponse.json({
        success: false,
        message: 'Only SELECT queries are allowed for testing'
      }, { status: 400 });
    }

    const result = await query(testQuery, params);

    return NextResponse.json({
      success: true,
      message: 'Custom query executed successfully',
      data: {
        rows: result.rows,
        row_count: result.rowCount,
        fields: result.fields?.map(field => ({
          name: field.name,
          dataTypeID: field.dataTypeID
        }))
      }
    });
  } catch (error) {
    console.error('Custom query test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Custom query failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}